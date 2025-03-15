import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

console.log("FIREBASE_API_KEY:", process.env.FIREBASE_API_KEY);
console.log("FIREBASE_AUTH_DOMAIN:", process.env.FIREBASE_AUTH_DOMAIN);
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("FIREBASE_STORAGE_BUCKET:", process.env.FIREBASE_STORAGE_BUCKET);
console.log(
  "FIREBASE_MESSAGING_SENDER_ID:",
  process.env.FIREBASE_MESSAGING_SENDER_ID
);
console.log("FIREBASE_APP_ID:", process.env.FIREBASE_APP_ID);

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const analytics = getAnalytics(app);

  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export const handler = async () => {
  try {
    // Ensure the environment variables are loaded
    if (!process.env.FIREBASE_API_KEY) {
      throw new Error("Firebase environment variables are missing.");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        firebaseConfig: firebaseConfig,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch Firebase config",
        message: error.message,
      }),
    };
  }
};
