import { useEffect, useState } from "react";

import { health, listProviders } from "../api/system";

/** Re-probe at most this often; several components ask at once. */
const TTL_MS = 30000;

let cache = null; // { at, value }
let inFlight = null;

const probe = () => {
  if (cache && Date.now() - cache.at < TTL_MS) return Promise.resolve(cache.value);
  inFlight ??= (async () => {
    try {
      const [status, providers] = await Promise.all([health(), listProviders()]);
      return {
        state: "online",
        environment: status?.environment,
        provider: providers?.default,
      };
    } catch (error) {
      return { state: "offline", message: error?.message };
    } finally {
      inFlight = null;
    }
  })().then((value) => {
    cache = { at: Date.now(), value };
    return value;
  });
  return inFlight;
};

/**
 * Is the API up, and which analysis engine is it defaulting to?
 *
 * The "engine online" badges used to be hardcoded, which made them decoration.
 * They now reflect an actual `/health` + `/analyses/providers` round trip.
 */
const useApiHealth = () => {
  const [status, setStatus] = useState(
    () => cache?.value ?? { state: "checking" }
  );

  useEffect(() => {
    let cancelled = false;
    probe().then((value) => {
      if (!cancelled) setStatus(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
};

export default useApiHealth;
