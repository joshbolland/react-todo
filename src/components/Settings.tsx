import React, { useState } from "react";
import { EmailAuthProvider, linkWithCredential, User } from "firebase/auth";

interface SettingsProps {
  user: User | null;
}

export default function Settings({ user }: SettingsProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!user || !user.email) {
      setError("User is not available. Please log in again.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await linkWithCredential(user, credential);
      setMessage("Password successfully set for your account.");
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 min-h-screen bg-[#FCFAF8]">
      <div className="max-w-sm mx-auto mt-10 bg-white shadow rounded-xl p-6 text-left">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">
          Account Settings
        </h1>

        {message && <p className="text-green-500 mb-4 text-sm">{message}</p>}
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full bg-gray-100 rounded-lg p-3 mt-1 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full bg-gray-100 rounded-lg p-3 mt-1 text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-row-reverse">
            <button
              type="submit"
              className="bg-[#7f54ff] text-white py-2 px-4 rounded-md w-auto text-sm font-semibold hover:bg-[#9b78ff] transition"
            >
              Save Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
