import PropTypes from "prop-types";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import * as authApi from "../api/auth";
import { ApiError } from "../api/client";
import { DEMO_CREDENTIALS } from "../api/demo";
import { setTelemetryUser } from "../observability/telemetry";
import {
  clearSession,
  fromAuthSession,
  getSession,
  setSession,
  setSessionUser,
  subscribe,
} from "../api/session";

export const AuthContext = createContext(null);

/**
 * Owns the signed-in session and every call that changes it.
 *
 * One provider rather than a hook each component calls: with a real token pair
 * there has to be a single copy of the session, or two components disagree
 * about who is signed in.
 */
export const AuthProvider = ({ children }) => {
  const [session, setLocalSession] = useState(getSession);
  // "checking" -> a stored token we have not validated yet.
  const [status, setStatus] = useState(() =>
    getSession() ? "checking" : "anonymous"
  );

  // Follow the store, including sign-in/out that happened in another tab.
  useEffect(
    () =>
      subscribe((next) => {
        setLocalSession(next);
        setStatus((current) => {
          if (!next) return "anonymous";
          return current === "anonymous" ? "checking" : current;
        });
      }),
    []
  );

  // A stored refresh token can have been revoked while the tab was closed, so
  // confirm it once on boot before showing the workspace.
  useEffect(() => {
    if (status !== "checking") return undefined;
    let cancelled = false;

    (async () => {
      try {
        const user = await authApi.readMe();
        if (cancelled) return;
        setSessionUser(user);
        setStatus("authenticated");
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          setStatus("anonymous");
        } else {
          // The API is unreachable, not the credential rejected — keep the
          // session rather than bouncing the user to sign-in over a blip.
          setStatus("authenticated");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status]);

  const signIn = useCallback(async (email, password, remember = false) => {
    const payload = await authApi.login(email.trim(), password);
    setSession(fromAuthSession(payload, remember));
    setStatus("authenticated");
    return payload.user;
  }, []);

  const signInAsDemo = useCallback(
    () => signIn(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password, false),
    [signIn]
  );

  const signUp = useCallback(
    async (fullName, email, password) => {
      await authApi.register(email, password, fullName);
      // Registration does not return tokens, so log in straight away — the
      // user asked to sign up, not to sign up and then sign in.
      return signIn(email, password, false);
    },
    [signIn]
  );

  const signOut = useCallback(async () => {
    const current = getSession();
    // Clear locally first: signing out should never wait on the network.
    clearSession();
    setStatus("anonymous");
    if (current?.refreshToken) {
      try {
        await authApi.logout(current.refreshToken);
      } catch {
        // Already expired or revoked server-side; nothing left to do.
      }
    }
  }, []);

  const updateName = useCallback(async (fullName) => {
    const user = await authApi.updateMe(fullName);
    setSessionUser(user);
    return user;
  }, []);

  const updatePassword = useCallback(
    async (currentPassword, newPassword) => {
      await authApi.changePassword(currentPassword, newPassword);
      // The API revokes every session on a password change, so the tokens in
      // hand are already dead: drop them and ask for a fresh sign-in.
      clearSession();
      setStatus("anonymous");
    },
    []
  );

  // Stamp the account onto every subsequent telemetry event, and clear it on
  // sign-out so a shared machine does not attribute the next person's errors to
  // whoever used it last. The id only — never the email address.
  useEffect(() => {
    setTelemetryUser(session?.user?.id ?? null);
  }, [session?.user?.id]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      status,
      isAuthenticated: status === "authenticated" && Boolean(session),
      isResolving: status === "checking",
      signIn,
      signInAsDemo,
      signUp,
      signOut,
      updateName,
      updatePassword,
      demoCredentials: DEMO_CREDENTIALS,
    }),
    [
      session,
      status,
      signIn,
      signInAsDemo,
      signUp,
      signOut,
      updateName,
      updatePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
