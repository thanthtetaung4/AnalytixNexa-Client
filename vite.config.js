/* eslint-env node */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:8000";
const OTLP_TARGET = process.env.VITE_OTLP_PROXY_TARGET ?? "http://localhost:4318";

// Bind-mounted source inside a container does not always deliver inotify
// events. Set VITE_POLL=1 there if edits stop triggering a reload.
const POLL = ["1", "true", "yes"].includes(
  (process.env.VITE_POLL ?? "").toLowerCase(),
);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: POLL ? { usePolling: true, interval: 300 } : undefined,
    // Proxy the API in development so the browser sees one origin: no CORS
    // preflights, and `VITE_API_BASE_URL` stays unset for local work.
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
      "/health": { target: API_TARGET, changeOrigin: true },
      // Browser telemetry to the OpenTelemetry collector. Proxied for the same
      // reason as /api: same-origin means no CORS preflight in front of every
      // batch, and no second hostname to configure per environment.
      "/otlp": {
        target: OTLP_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/otlp/, ""),
      },
    },
  },
});
