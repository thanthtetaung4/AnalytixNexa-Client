import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

const AuthGuard = () => {
  const { auth } = useContext(AuthContext);
  // console.log(auth.user);
  if (!auth.user) {
    // console.log("Blocked");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
