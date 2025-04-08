import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import logo from "./assets/tick.png";
import { Menu, User, ChevronDown } from "lucide-react";

export default function Navbar({
  auth,
  setUser,
  sidebarIsOpen,
  setSidebarIsOpen,
  isDesktop,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/login"); // Redirect to login after logout
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex w-full min-h-20 justify-between">
      <div className={`${isDesktop ? "w-1/3 pt-8 bg-[#FCFAF8]" : "w-1/8"}`}>
        <button
          className="sm:hidden p-2 m-2"
          onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
          aria-label="Toggle Sidebar"
        >
          {!sidebarIsOpen && <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div
        ref={dropdownRef}
        className="w-2/3 bg-white flex justify-start items-center p-2 ml-5"
      >
        <Link to="/">
          <img src={logo} className="w-12" alt="Logo" />
        </Link>

        <div className="ml-auto relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 text-white bg-[#7f54ff] hover:bg-[#9b78ff] cursor-pointer focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 py-2.5"
          >
            <User className="w-4 h-4" />
            <ChevronDown
              className={`w-4 h-4 transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg text-gray-700">
              <div className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-left">
                <Link to="/settings">Settings</Link>
              </div>
              <div
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-left"
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
