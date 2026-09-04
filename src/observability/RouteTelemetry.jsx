/**
 * Reports route changes.
 *
 * A component rather than a call inside the router because `useLocation` is the
 * only reliable way to see a client-side navigation: React Router does not
 * touch `window.location` events, so a `popstate` listener would miss every
 * in-app link. Renders nothing.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { recordNavigation } from "./telemetry";

export default function RouteTelemetry() {
  const location = useLocation();

  useEffect(() => {
    recordNavigation(location.pathname);
  }, [location.pathname]);

  return null;
}
