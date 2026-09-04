/**
 * The one place that talks to the AnalytixNexa API.
 *
 * Responsibilities kept here so no caller has to think about them:
 *  - base URL (`/api/v1` through the dev proxy, `VITE_API_BASE_URL` in a build)
 *  - bearer token attachment
 *  - refreshing an expired access token, once, even if ten requests race
 *  - turning the API's `{"error": {"code", "message"}}` body into an ApiError
 *    that UI code can branch on by `code` rather than by prose
 */

import { startApiSpan } from "../observability/telemetry";
import { traceparent } from "../observability/ids";
import {
  clearSession,
  fromAuthSession,
  getSession,
  setSession,
} from "./session";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

/** Versioned API root, e.g. `/api/v1` or `https://api.example.com/api/v1`. */
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

/** Server root, for the probes that sit outside the version prefix (`/health`). */
export const API_ROOT = API_BASE.replace(/\/api\/v\d+$/, "");

const STATUS_FALLBACK = {
  0: "Could not reach the API. Check that the server is running.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have access to that.",
  404: "That resource no longer exists.",
  409: "That already exists.",
  413: "That file is too large to upload.",
  422: "The submitted data is invalid.",
  500: "The API hit an unexpected error. Please try again.",
  502: "The API is unreachable right now. Please try again.",
  503: "The API is unreachable right now. Please try again.",
};

export class ApiError extends Error {
  constructor({ status = 0, code = "api_error", message, details }) {
    super(message || STATUS_FALLBACK[status] || "The request failed.");
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details ?? {};
  }
}

export const isUnauthorized = (error) =>
  error instanceof ApiError && error.status === 401;

const readBody = async (response) => {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const toApiError = (response, body) => {
  const error = body?.error;
  return new ApiError({
    status: response.status,
    code: error?.code ?? `http_${response.status}`,
    message: error?.message,
    details: error?.details,
  });
};

let refreshing = null;

/**
 * Rotate the refresh token. Single-flight: concurrent 401s share one call, so
 * the API only ever sees one rotation and the losers do not present a token
 * that was just revoked.
 */
const refreshSession = () => {
  const current = getSession();
  if (!current?.refreshToken) return Promise.resolve(null);

  refreshing ??= (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: current.refreshToken }),
      });
      const body = await readBody(response);
      if (!response.ok) {
        clearSession();
        return null;
      }
      const next = fromAuthSession(body, current.remember);
      setSession(next);
      return next;
    } catch {
      // A network blip is not proof the token is dead — keep the session and
      // let the caller surface the failure.
      return null;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
};

/**
 * Perform an API call.
 *
 * @param {string} path        path below the base, e.g. `/datasets`
 * @param {object} [options]
 * @param {string} [options.method]
 * @param {any}    [options.json]      body, JSON-encoded
 * @param {FormData} [options.formData] body, multipart (do not set headers)
 * @param {boolean}[options.auth]      attach the bearer token (default true)
 * @param {string} [options.base]      override the base URL (see API_ROOT)
 * @param {AbortSignal} [options.signal]
 */
export const request = async (
  path,
  { method = "GET", json, formData, auth = true, base = API_BASE, signal } = {}
) => {
  const headers = {};
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (formData) {
    // Let the browser set the multipart boundary.
    body = formData;
  }

  let session = auth ? getSession() : null;
  if (session?.expiresAt && session.expiresAt <= Date.now()) {
    session = (await refreshSession()) ?? getSession();
  }

  // One span per logical API call, spanning the refresh-and-retry below so a
  // 401 that recovers is recorded as the single call the user actually made.
  // `traceparent` hands the backend this trace to continue, which is what makes
  // a slow page and the SQL behind it one trace rather than two.
  const span = startApiSpan(method, path);
  const trace = { traceparent: traceparent(span.traceId, span.spanId) };

  const send = (accessToken) =>
    fetch(`${base}${path}`, {
      method,
      body,
      signal,
      headers: accessToken
        ? { ...headers, ...trace, Authorization: `Bearer ${accessToken}` }
        : { ...headers, ...trace },
    });

  const sentToken = auth ? session?.accessToken : undefined;

  let response;
  try {
    response = await send(sentToken);
  } catch (cause) {
    if (cause?.name === "AbortError") {
      // A cancelled request is not a failure — usually the user navigated away.
      span.finish({ status: 0 });
      throw cause;
    }
    span.finish({ error: { code: "network_error" } });
    throw new ApiError({ status: 0, code: "network_error" });
  }

  if (response.status === 401 && auth) {
    const stored = getSession();
    if (stored?.accessToken && stored.accessToken !== sentToken) {
      // A parallel request already refreshed while this one was in flight —
      // retry with its token instead of rotating again.
      response = await send(stored.accessToken);
    } else if (stored?.refreshToken) {
      const renewed = await refreshSession();
      if (renewed) response = await send(renewed.accessToken);
    }
  }
  if (response.status === 401 && auth) {
    // The token is genuinely dead: drop it so the app falls back to sign-in
    // instead of retrying with a credential that will never work.
    clearSession();
  }

  const payload = await readBody(response);
  span.finish({ status: response.status });
  if (!response.ok) throw toApiError(response, payload);
  return payload;
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
