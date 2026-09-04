import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initTelemetry } from "./observability/telemetry";
import { ThemeContextProvider } from "./theme/ThemeContextProvider";

// Before render, so an error thrown while the tree is mounting is still caught
// by the global handlers this installs.
initTelemetry();

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeContextProvider>
    <App />
  </ThemeContextProvider>
);
