import { Navigate } from "react-router-dom";

/** `/` is resolved in AppRoutes; this is a safety net for direct hits. */
function Home() {
  return <Navigate to="/dashboard" replace />;
}

export default Home;
