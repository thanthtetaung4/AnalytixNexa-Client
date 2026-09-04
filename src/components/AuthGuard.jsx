import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "./useAuth";
import { LoadingScreen } from "./ui";

const AuthGuard = () => {
  const { isAuthenticated, isResolving } = useAuth();
  const location = useLocation();

  if (isResolving) return <LoadingScreen label="Restoring your session" />;
  if (!isAuthenticated) {
    // Remember where they were headed so sign-in can return them there.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export default AuthGuard;
