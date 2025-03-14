// Login.jsx
import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import tick from "./assets/tick.png";

const Login = ({ setUser, auth }) => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Logged in as:", user.displayName);
      setUser(user); // Set the user state in App component (passed via props)
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
    }
  };

  return (
    <div className="flex flex-col bg-white shadow-md border border-gray-200 rounded-lg max-w-sm p-4 sm:p-6 lg:p-8 items-center">
      <h1 className="text-3xl mb-2">TailDo</h1>
      <img src={tick} className="w-18 mb-2"></img>
      <button
        onClick={handleGoogleSignIn}
        className="cursor-pointer text-white w-full  bg-[#3292FF] hover:bg-[#3292FF]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between mr-2 mb-2"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
