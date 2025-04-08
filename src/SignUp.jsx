import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";

const SignUp = ({ setUser, auth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First try to create account with email/password
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;
      setUser(user);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered. If you have previously signed in with Google, sign in again in order to set a password from your settings page."
        );
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col max-w-sm w-full p-6 sm:p-8 items-center space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Create an Account
        </h1>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSignUp} className="w-full space-y-4">
          <div className="w-full">
            <input
              type="email"
              className="w-full p-3 rounded-lg border border-gray-300"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="w-full">
            <input
              type="password"
              className="w-full p-3 rounded-lg border border-gray-300"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white bg-[#3292FF] hover:bg-[#3292FF]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="animate-spin w-5 h-5 border-4 border-white border-t-transparent rounded-full"></div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="text-sm text-gray-500">
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-blue-600">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
