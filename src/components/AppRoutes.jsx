import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard/Dashboard";
import Settings from "../pages/Dashboard/Settings";
import Account from "../pages/Dashboard/Account";
import Analyze from "../pages/Dashboard/Analyze";
import Files from "../pages/Dashboard/Files";
import Result from "../pages/Dashboard/Result";
import AuthGuard from "./AuthGuard";
import DashboardLayout from "./DashboardLayout";
import useAuth from "./useAuth";
import { LoadingScreen } from "./ui";

const AppRoutes = () => {
  const { isAuthenticated, isResolving } = useAuth();

  // A stored token is validated before the first render decides anything —
  // otherwise a returning user is bounced to /login and then back again.
  if (isResolving) return <LoadingScreen label="Restoring your session" />;

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignUp />}
      />
      {/* Reachable signed in or out. Someone who is signed in on this device
          and has forgotten their password still needs the reset flow, and the
          link in the email must work whatever the session state is. */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AuthGuard />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analyze" element={<Analyze />} />
          <Route path="files" element={<Files />} />
          <Route path="result" element={<Result />} />
          <Route path="settings" element={<Settings />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
