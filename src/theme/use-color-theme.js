import { createTheme } from "@mui/material";
import React from "react";
import { getDesignTokens } from "./theme";

const STORAGE_KEY = "analytixnexa.theme";
const DEFAULT_MODE = "dark";

const normalise = (mode) => (mode === "light" ? "light" : DEFAULT_MODE);

/**
 * Appearance is a device preference, not account data: the API has no place to
 * hang it and reading it locally means the right palette paints on first frame
 * instead of after a round trip.
 */
const readStoredMode = () => {
  try {
    return normalise(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_MODE;
  }
};

export const useColorTheme = () => {
  const [mode, setMode] = React.useState(readStoredMode);

  const toggleColorMode = React.useCallback(() => {
    setMode((previous) => {
      const next = previous === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Storage blocked; the choice still applies for this session.
      }
      return next;
    });
  }, []);

  const modifiedTheme = React.useMemo(
    () => createTheme(getDesignTokens(mode)),
    [mode]
  );

  return { theme: modifiedTheme, mode, toggleColorMode };
};
