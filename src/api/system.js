/** Service probes: is the backend up, and which engine will run my analysis. */

import { API_ROOT, request } from "./client";

export const health = () =>
  request("/health", { auth: false, base: API_ROOT });

export const databaseHealth = () =>
  request("/health/db", { auth: false, base: API_ROOT });

export const listProviders = () => request("/analyses/providers", { auth: false });
