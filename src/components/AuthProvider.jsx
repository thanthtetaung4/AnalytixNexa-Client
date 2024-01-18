import PropTypes from "prop-types";
import { createContext } from "react";
import useAuth from "./useAuth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  // console.log(auth);
  return (
    <AuthContext.Provider value={{ auth }}>{children}</AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
