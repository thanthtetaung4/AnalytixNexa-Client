import { useEffect, useState } from "react";

import { listProviders } from "../api/system";

/** The provider list changes only on redeploy, so one fetch per page load. */
const TTL_MS = 60000;

let cache = null; // { at, value }
let inFlight = null;

const initialState = { loading: true, providers: [], defaultProvider: null };

const load = () => {
  if (cache && Date.now() - cache.at < TTL_MS) return Promise.resolve(cache.value);
  inFlight ??= listProviders()
    .then((body) => ({
      loading: false,
      providers: body?.providers ?? [],
      defaultProvider: body?.default ?? null,
    }))
    .catch((error) => ({
      loading: false,
      providers: [],
      defaultProvider: null,
      error,
    }))
    .then((value) => {
      cache = { at: Date.now(), value };
      inFlight = null;
      return value;
    });
  return inFlight;
};

/**
 * Which analysis engines this deployment can run.
 *
 * `available` is the field that matters: the AI engine is always implemented
 * but is only usable where the server has an API key. Reading it lets the
 * picker disable that option with a reason instead of offering a choice that
 * fails on submit.
 */
const useProviders = () => {
  const [state, setState] = useState(() => cache?.value ?? initialState);

  useEffect(() => {
    let cancelled = false;
    load().then((value) => {
      if (!cancelled) setState(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ...state,
    runnable: state.providers.filter((provider) => provider.implemented && provider.available),
    byName: (name) => state.providers.find((provider) => provider.name === name),
  };
};

export default useProviders;
