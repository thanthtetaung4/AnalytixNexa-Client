import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

const AuthGuard = () => {
  const { auth } = useContext(AuthContext);
  console.log("from auth Guard", auth.user);
  if (!auth.user) {
    console.log("Blocked");
    return <Navigate to="/login" replace />;
  }
  if (!auth.user.emailVerified) {
    // Redirect to verification page if user is not verified
    return <Navigate to="/verify" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
