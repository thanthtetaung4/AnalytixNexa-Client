import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Settings from "../pages/Dashboard/Settings";
import AuthGuard from "./AuthGuard";
import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";
import DashboardLayout from "./DashboardLayout";

const AppRoutes = () => {
  const auth = useAuth();
  // console.log(auth.user);
  return (
    <>
      {!auth.user ? (
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="/dashboard/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      )}
    </>
  );
};

export default AppRoutes;
