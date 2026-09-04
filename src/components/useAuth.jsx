import { useContext } from "react";

import { AuthContext } from "./AuthProvider";

/** Access the signed-in session and the calls that change it. */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};

export default useAuth;
