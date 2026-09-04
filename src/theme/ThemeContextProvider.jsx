import { createTheme } from "@mui/material";
import PropTypes from "prop-types";
import { createContext, useContext } from "react";
import { useColorTheme } from "./use-color-theme";

export const ThemeContext = createContext({
  mode: "light",
  toggleColorMode: () => {},
  theme: createTheme(),
});

export const ThemeContextProvider = ({ children }) => {
  const value = useColorTheme();
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

ThemeContextProvider.propTypes = {
  children: PropTypes.node,
};

// context + hook live beside the provider on purpose; fast refresh only warns
// because the file exports more than the component itself
// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = () => {
  return useContext(ThemeContext);
};
