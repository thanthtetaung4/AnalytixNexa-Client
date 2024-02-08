import { indigo, blue, grey } from "@mui/material/colors";

const theme = {
  palette: {
    primary: indigo,
  },
};

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // palette values for light mode
          primary: blue,
          text: {
            primary: grey[900],
            secondary: grey[800],
          },
          modal: {
            main: "#fff",
          },
        }
      : {
          // palette values for dark mode
          primary: indigo,
          // divider: indigo[700],
          background: {
            default: "#233142",
            paper: "#233142",
          },
          text: {
            primary: "#fff",
            secondary: grey[500],
          },
          modal: {
            main: "#233142",
          },
        }),
  },

  // palette: {
  //   mode: mode,
  //   background: {
  //     default: "#233142",
  //   },
  //   text: {
  //     primary: {
  //       light: "#000",
  //       main: "#fff",
  //       dark: "#fff",
  //     },
  //   },
  //   primary: {
  //     light: "#bfe6f4",
  //     main: "#6daed6",
  //     dark: "#455d7a",
  //   },
  //   secondary: {
  //     light: "#ffd0d6",
  //     main: "#fe483f",
  //     dark: "#c22325",
  //   },
  // },
});

export default theme;
