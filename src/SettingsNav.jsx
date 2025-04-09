import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import logo from "./assets/tick.png";

const UserIcon = lazy(() => import("lucide-react").then((module) => ({ default: module.User })));
const ChevronDownIcon = lazy(() => import("lucide-react").then((module) => ({ default: module.ChevronDown })));


export default function Navbar({ auth, setUser }) {
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
    <div className="flex w-full min-h-20 justify-between bg-[#FCFAF8]">
      <div
        ref={dropdownRef}
        className="w-full flex justify-start items-center p-2 ml-5"
      >
        <Link to="/">
          <img src={logo} className="w-12" alt="Logo" />
        </Link>

        <div className="ml-auto relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 text-white bg-[#7f54ff] hover:bg-[#9b78ff] cursor-pointer focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 py-2.5"
          >
            <Suspense fallback={<div>Loading...</div>}>
              <UserIcon className="w-4 h-4" />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <ChevronDownIcon
                className={`w-4 h-4 transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </Suspense>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow-lg z-10">
              <Link
                to="/settings"
                className="block px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
