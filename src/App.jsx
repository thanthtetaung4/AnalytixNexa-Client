import { BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import AppRoutes from "./components/AppRoutes";
import RouteTelemetry from "./observability/RouteTelemetry";
import { AuthProvider } from "./components/AuthProvider";
import { WorkspaceProvider } from "./components/WorkspaceProvider";
import { useThemeContext } from "./theme/ThemeContextProvider";

function App() {
  const { theme } = useThemeContext();

  return (
    <AuthProvider>
      {/* datasets and analyses are per-user, so this sits inside the auth
          provider and resets when the session changes */}
      <WorkspaceProvider>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            {/* inside the router, so it can see client-side navigations */}
            <RouteTelemetry />
            <AppRoutes />
          </ThemeProvider>
        </BrowserRouter>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
