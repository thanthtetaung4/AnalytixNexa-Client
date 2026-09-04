/**
 * Browser telemetry: errors, API calls and navigations.
 *
 * What is sent, and nothing beyond it:
 *
 *   - **errors** — uncaught exceptions and unhandled promise rejections, with
 *     the message, the stack and where it happened;
 *   - **API calls** — method, path template, status and duration, as a span
 *     that shares its trace id with the backend's;
 *   - **navigations** — the route the user moved to.
 *
 * What is deliberately not sent: request and response bodies, form values,
 * query strings, tokens, and anything typed into the page. A browser is the
 * least controlled place data can leak from, so the rule here is that
 * telemetry carries shapes and outcomes, never content. Paths are reduced to
 * templates (`/datasets/:id`) before they leave, so an id never becomes a
 * searchable field by accident.
 *
 * Enabled by `VITE_TELEMETRY_ENABLED`. Off, every function here is a no-op —
 * the call sites stay in place and cost nothing.
 */

import { OtlpExporter, attributes, toNanos } from "./exporter";
import { newSpanId, newTraceId } from "./ids";

const ENABLED = import.meta.env.VITE_TELEMETRY_ENABLED === "true";
const ENDPOINT = import.meta.env.VITE_OTLP_ENDPOINT ?? "/otlp";
const SERVICE = import.meta.env.VITE_SERVICE_NAME ?? "analytixnexa-client";
const ENVIRONMENT = import.meta.env.VITE_DEPLOY_ENV ?? "development";

// OTLP severity numbers, from the logs data model.
const SEVERITY = { DEBUG: 5, INFO: 9, WARN: 13, ERROR: 17 };

/**
 * One id per page load, so the events of a single visit can be pulled together
 * without anything that identifies the person. Not persisted: a reload starts a
 * new session, which is the point — this is for grouping a sequence of actions,
 * not for recognising a returning user.
 */
const SESSION_ID = newTraceId();

let exporter = null;
let currentUserId = null;

/** Start the exporter and install the global error handlers. */
export function initTelemetry() {
  if (!ENABLED || exporter) return;

  exporter = new OtlpExporter({
    endpoint: ENDPOINT,
    resource: {
      "service.name": SERVICE,
      "deployment.environment": ENVIRONMENT,
      "telemetry.sdk.language": "webjs",
      "browser.language": navigator.language,
      // The full user-agent string is a fingerprinting surface and is not
      // needed to answer "is this browser broken"; the platform is.
      "browser.platform": navigator.platform,
    },
  });
  exporter.start();

  window.addEventListener("error", (event) => {
    recordError(event.error ?? event.message, {
      "error.source": "window.onerror",
      "code.filepath": event.filename,
      "code.lineno": event.lineno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    recordError(event.reason, { "error.source": "unhandledrejection" });
  });

  recordEvent("app.loaded", { "page.route": routeTemplate(window.location.pathname) });
}

/**
 * Attach (or clear, with null) the signed-in account.
 *
 * The account id, never the email address: it answers "which user hit this"
 * for anyone with access to the account, without putting a list of customer
 * email addresses into the log store.
 */
export function setTelemetryUser(userId) {
  currentUserId = userId ? String(userId) : null;
}

/** The current page-load session id, for correlating events by visit. */
export const telemetrySessionId = () => SESSION_ID;

function baseAttributes(extra = {}) {
  return {
    "session.id": SESSION_ID,
    "enduser.id": currentUserId,
    ...extra,
  };
}

/** Record one structured event. */
export function recordEvent(name, extra = {}, severity = "INFO") {
  if (!exporter) return;
  exporter.emitLog({
    timeUnixNano: toNanos(Date.now()),
    severityNumber: SEVERITY[severity] ?? SEVERITY.INFO,
    severityText: severity,
    body: { stringValue: name },
    attributes: attributes(baseAttributes({ event: name, ...extra })),
  });
}

/** Record an error, from a global handler or a caught one worth reporting. */
export function recordError(error, extra = {}) {
  if (!exporter) return;
  const isError = error instanceof Error;
  recordEvent(
    "client.error",
    {
      "error.type": isError ? error.name : typeof error,
      "error.message": String(isError ? error.message : error).slice(0, 500),
      // Capped: a deep stack is diagnostic, an unbounded one is a payload.
      "exception.stacktrace": isError ? String(error.stack ?? "").slice(0, 2000) : undefined,
      ...extra,
    },
    "ERROR"
  );
}

/** Record a route change. */
export function recordNavigation(pathname) {
  recordEvent("client.navigation", { "page.route": routeTemplate(pathname) });
}

/**
 * Begin an API-call span.
 *
 * Returns the ids to put in `traceparent` plus a `finish` to call once the
 * response (or failure) is known. The span is only emitted on finish, because
 * its duration and status are the whole point of having it.
 */
export function startApiSpan(method, path) {
  const traceId = newTraceId();
  const spanId = newSpanId();

  if (!exporter) {
    return { traceId, spanId, finish: () => {} };
  }

  const startedMs = Date.now();
  const startedPerf = performance.now();
  const route = routeTemplate(path);

  const finish = ({ status = 0, error } = {}) => {
    const durationMs = performance.now() - startedPerf;
    exporter.emitSpan({
      traceId,
      spanId,
      name: `${method} ${route}`,
      // 3 = CLIENT: this span is the caller's side of a remote call.
      kind: 3,
      startTimeUnixNano: toNanos(startedMs),
      endTimeUnixNano: toNanos(startedMs + durationMs),
      // 2 = ERROR, 0 = UNSET. Leaving success UNSET rather than OK is the
      // convention: it keeps "explicitly failed" the only positive signal.
      status: { code: status >= 400 || error ? 2 : 0 },
      attributes: attributes(
        baseAttributes({
          "http.request.method": method,
          "http.route": route,
          "http.response.status_code": status || undefined,
          "error.type": error ? String(error.code ?? error.name ?? "error") : undefined,
        })
      ),
    });

    // A failed call is also an event, so that "what went wrong" is one query
    // over the log stream rather than a join against the trace store.
    if (status >= 400 || error) {
      recordEvent(
        "client.api_error",
        {
          "http.request.method": method,
          "http.route": route,
          "http.response.status_code": status || undefined,
          "error.type": error ? String(error.code ?? error.name ?? "error") : undefined,
          "trace.id": traceId,
        },
        status >= 500 || error ? "ERROR" : "WARN"
      );
    }
  };

  return { traceId, spanId, finish };
}

/**
 * Reduce a concrete path to a route template.
 *
 * `/datasets/8f2c…/preview` becomes `/datasets/:id/preview`. Without this every
 * dataset produces its own `http.route` value, which makes grouping useless and
 * quietly turns identifiers into indexed fields.
 */
export function routeTemplate(path) {
  return String(path)
    .split("?")[0]
    .split("/")
    .map((segment) => {
      if (!segment) return segment;
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return ":id";
      if (/^[0-9a-f]{16,}$/i.test(segment)) return ":id";
      if (/^\d+$/.test(segment)) return ":n";
      return segment;
    })
    .join("/");
}

/** Push anything queued. Called before the app tears down. */
export function flushTelemetry() {
  exporter?.flush({ beacon: true });
}
