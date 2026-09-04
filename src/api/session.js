/**
 * Where the signed-in session lives.
 *
 * The API hands out a short-lived access token plus a rotating refresh token,
 * so the client has to keep both somewhere. "Keep me signed in" picks the
 * bucket: `localStorage` survives a browser restart, `sessionStorage` dies with
 * the tab. Everything reads through here so there is exactly one copy of the
 * truth, and subscribers (the auth provider, other tabs) are told when it
 * changes.
 */

const STORAGE_KEY = "analytixnexa.session";

const listeners = new Set();
let cached = null;
let loaded = false;

const store = (remember) =>
  remember ? window.localStorage : window.sessionStorage;

const parse = (raw) => {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return value?.accessToken ? value : null;
  } catch {
    return null;
  }
};

const readFromStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    // sessionStorage first: a tab-scoped sign-in should win over a stale
    // remembered one in the same tab.
    return (
      parse(window.sessionStorage.getItem(STORAGE_KEY)) ??
      parse(window.localStorage.getItem(STORAGE_KEY))
    );
  } catch {
    // Private modes can throw on access rather than returning null.
    return null;
  }
};

const emit = () => {
  for (const listener of listeners) listener(cached);
};

/** Shape the API's AuthSession payload into what the client stores. */
export const fromAuthSession = (payload, remember = false) => ({
  accessToken: payload.access_token,
  refreshToken: payload.refresh_token,
  // Refresh a little early: a token that expires mid-flight reads to the user
  // as a random failure.
  expiresAt: Date.now() + Math.max(0, (payload.expires_in ?? 900) - 30) * 1000,
  user: payload.user ?? null,
  remember,
});

export const getSession = () => {
  if (!loaded) {
    cached = readFromStorage();
    loaded = true;
  }
  return cached;
};

export const setSession = (session) => {
  cached = session;
  loaded = true;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(STORAGE_KEY);
      if (session) {
        store(session.remember).setItem(STORAGE_KEY, JSON.stringify(session));
      }
    } catch {
      // Storage unavailable — the in-memory copy still carries this tab.
    }
  }
  emit();
};

export const clearSession = () => setSession(null);

/** Merge a fresh /users/me record into the stored session. */
export const setSessionUser = (user) => {
  const current = getSession();
  if (!current) return;
  setSession({ ...current, user });
};

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

if (typeof window !== "undefined") {
  // Another tab signed in or out: pick up its session instead of holding a
  // token that has already been revoked.
  window.addEventListener("storage", (event) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    cached = readFromStorage();
    loaded = true;
    emit();
  });
}
