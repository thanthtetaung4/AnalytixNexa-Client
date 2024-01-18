import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./components/AppRoutes";
import { AuthProvider } from "./components/AuthProvider";
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import { useState } from "react";

function App() {
  // const [isDarkMode, setIsDarkMode] = useState(true);
  const myTheme = createTheme({
    palette: {
      mode: "dark",
      background: {
        default: "#233142",
      },
      text: {
        primary: "#fff",
      },
      primary: {
        light: "#bfe6f4",
        main: "#6daed6",
        dark: "#455d7a",
      },
      secondary: {
        light: "#ffd0d6",
        main: "#fe483f",
        dark: "#c22325",
      },
    },
  });
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider theme={myTheme}>
          <CssBaseline />
          <AppRoutes />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
