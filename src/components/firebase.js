import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBTuHLXNRHts6PyHCK_Aa9eNSEZG9uvIdA",

  authDomain: "analytixnexa.firebaseapp.com",

  projectId: "analytixnexa",

  storageBucket: "analytixnexa.appspot.com",

  messagingSenderId: "1085839248650",

  appId: "1:1085839248650:web:86bf56627877bce66e3ef3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
