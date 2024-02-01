import PropTypes from "prop-types";
import { createContext } from "react";
import useAuth from "./useAuth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  console.log("from auth provide", auth);
  // console.log("Current user from provider");
  return (
    <AuthContext.Provider value={{ auth }}>{children}</AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
