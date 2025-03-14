// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration will be fetched via Netlify function
export const initializeFirebase = (config) => {
  const app = initializeApp(config);
  const auth = getAuth(app);
  return { app, auth };
};
