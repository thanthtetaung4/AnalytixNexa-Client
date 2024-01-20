import { useState, useEffect } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

const useAuth = () => {
  const [user, setUser] = useState(
    sessionStorage.getItem("user")
      ? JSON.parse(sessionStorage.getItem("user"))
      : localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );

  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password, isRemember) => {
    // Set persistence first
    !isRemember && (await setPersistence(auth, browserSessionPersistence));

    // Sign in
    await signInWithEmailAndPassword(auth, email, password);

    // Store user information based on persistence
    if (isRemember) {
      localStorage.setItem("user", JSON.stringify(auth.currentUser));
    } else {
      sessionStorage.setItem("user", JSON.stringify(auth.currentUser));
    }

    // console.log("Login successful", auth.currentUser); // Log for verification
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Signed in with Google", result);
        console.log(`${auth.currentUser.email} is Signed In`);
        localStorage.setItem("user", JSON.stringify(auth.currentUser));
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    console.log(user, localStorage.getItem("user")),
      sessionStorage.getItem("user");
  };

  return { user, login, loginWithGoogle, logout };
};

export default useAuth;
