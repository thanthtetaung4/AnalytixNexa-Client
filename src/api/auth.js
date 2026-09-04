/** Auth and profile endpoints. */

import { request } from "./client";

export const login = (email, password) =>
  request("/auth/login", {
    method: "POST",
    auth: false,
    json: { email, password },
  });

export const register = (email, password, fullName) =>
  request("/auth/register", {
    method: "POST",
    auth: false,
    json: { email, password, full_name: fullName || null },
  });

export const logout = (refreshToken) =>
  request("/auth/logout", {
    method: "POST",
    auth: false,
    json: { refresh_token: refreshToken },
  });

export const readMe = () => request("/users/me");

export const updateMe = (fullName) =>
  request("/users/me", { method: "PATCH", json: { full_name: fullName } });

export const changePassword = (currentPassword, newPassword) =>
  request("/users/me/password", {
    method: "POST",
    json: { current_password: currentPassword, new_password: newPassword },
  });

/**
 * Ask for a reset link by email.
 *
 * Answers 200 whether or not the address has an account — the API will not say
 * which, so neither can the UI. Callers must show the same confirmation either
 * way rather than trying to infer an answer from the response.
 */
export const requestPasswordReset = (email) =>
  request("/auth/password-reset/request", {
    method: "POST",
    auth: false,
    json: { email },
  });

/** Spend a token from a reset email. Revokes every session on success. */
export const confirmPasswordReset = (token, newPassword) =>
  request("/auth/password-reset/confirm", {
    method: "POST",
    auth: false,
    json: { token, new_password: newPassword },
  });

/** Email the signed-in user a reset link for their own account. */
export const emailMyResetLink = () =>
  request("/users/me/password/reset-link", { method: "POST", json: {} });
