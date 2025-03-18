import { signOut } from "firebase/auth";
import logo from "./assets/tick.png";

export default function Navbar({ auth, setUser }) {
  const handleLogout = async () => {
    await signOut(auth); // Sign out the user from Firebase
    setUser(null); // Clear the user state
  };

  return (
    <div className="flex w-full min-h-20">
      <div className="w-1/3 bg-[#FCFAF8]"></div>
      <div className="w-2/3 bg-white flex justify-between items-center p-2 ml-5">
        <div></div>
        <div>
          <img src={logo} className="w-12" alt="Logo" />
        </div>
        <div className="text-right">
          <button
            onClick={handleLogout}
            className="logout-button focus:outline-none text-white bg-[#7f54ff] hover:bg-[#9b78ff] cursor-pointer focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
