import { signOut } from "firebase/auth";
import logo from "./assets/tick.png";
import { Menu, X } from "lucide-react";

export default function Navbar({
  auth,
  setUser,
  sidebarIsOpen,
  setSidebarIsOpen,
  isDesktop,
}) {
  const handleLogout = async () => {
    await signOut(auth); // Sign out the user from Firebase
    setUser(null); // Clear the user state
  };

  return (
    <div className="flex w-full min-h-20 justify-between">
      <div className={`${isDesktop ? "w-1/3 pt-8 bg-[#FCFAF8]" : "w-1/8"}`}>
        <button
          className="sm:hidden p-2 m-2"
          onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
          aria-label="Toggle Sidebar"
        >
          {sidebarIsOpen ? <></> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      <div className="w-2/3 bg-white flex justify-start items-center p-2 ml-5">
        <div>
          <img src={logo} className="w-12" alt="Logo" />
        </div>
        <div className="text-right ml-auto">
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
