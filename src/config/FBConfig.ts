import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FirebaseConfig } from "../types/types"

// Firebase configuration will be fetched via Netlify function
export const initializeFirebase = (config: FirebaseConfig) => {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);

  return { app, auth, db };
};
