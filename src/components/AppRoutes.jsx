import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Settings from "../pages/Dashboard/Settings";
import Account from "../pages/Dashboard/Account";
import Analyze from "../pages/Dashboard/Analyze";
import Files from "../pages/Dashboard/Files";
import Result from "../pages/Dashboard/Result";
import AuthGuard from "./AuthGuard";
import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";
import DashboardLayout from "./DashboardLayout";

const AppRoutes = () => {
  const auth = useAuth();
  // console.log(auth.user);
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            !auth.user ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/dashboard/analyze" element={<Analyze />} />
            <Route path="/dashboard/files" element={<Files />} />
            <Route path="/dashboard/result" element={<Result />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/account" element={<Account />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;
