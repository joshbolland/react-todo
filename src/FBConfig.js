// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration will be fetched via Netlify function
export const initializeFirebase = (config) => {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);

  return { app, auth, db };
};
