import { createTheme } from "@mui/material";
import React, { useEffect } from "react";
import { getDesignTokens } from "./theme";
import useAuth from "../components/useAuth";

export const useColorTheme = () => {
  const { userDetails, changeTheme } = useAuth();
  const [mode, setMode] = React.useState(
    userDetails ? userDetails.theme : "dark"
  );

  useEffect(() => {
    setMode(userDetails?.theme);
  }, [userDetails]);

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      changeTheme(newMode);
      return newMode;
    });
  };

  // const modifiedTheme = React.useMemo(
  //   () =>
  //     createTheme({
  //       ...theme,
  //       palette: {
  //         ...theme.palette,
  //         mode,
  //       },
  //     }),
  //   [mode]
  // );

  const modifiedTheme = React.useMemo(
    () => createTheme(getDesignTokens(mode)),
    [mode]
  );

  return {
    theme: modifiedTheme,
    mode,
    toggleColorMode,
  };
};
