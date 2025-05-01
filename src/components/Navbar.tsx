import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, Auth, User } from "firebase/auth";
import logo from "../assets/tick.png";

interface NavbarProps {
  auth: Auth | null;
  setUser: (user: User | null) => void;
  sidebarIsOpen: boolean;
  setSidebarIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDesktop: boolean;
}

// Lazy load the icons
const MenuIcon = lazy(() =>
  import("lucide-react").then((module) => ({ default: module.Menu }))
);
const UserIcon = lazy(() =>
  import("lucide-react").then((module) => ({ default: module.User }))
);
const ChevronDownIcon = lazy(() =>
  import("lucide-react").then((module) => ({ default: module.ChevronDown }))
);

export default function Navbar({
  auth,
  setUser,
  sidebarIsOpen,
  setSidebarIsOpen,
  isDesktop,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    navigate("/login"); // Redirect to login after logout
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target;
    if (
      dropdownRef.current &&
      target instanceof Node &&
      !dropdownRef.current.contains(target)
    ) {
      setDropdownOpen(false);
    }
  };

  const handleSideBarToggle = () => {
    setSidebarIsOpen(!sidebarIsOpen);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex w-full min-h-20 justify-between">
      <div className={`${isDesktop ? "w-1/4 pt-8 bg-[#FCFAF8]" : "w-1/8"}`}>
        <button
          className="sm:hidden p-2 m-2"
          onClick={handleSideBarToggle}
          aria-label="Toggle Sidebar"
        >
          <Suspense fallback={<div>Loading...</div>}>
            {!sidebarIsOpen && <MenuIcon className="w-6 h-6" />}
          </Suspense>
        </button>
      </div>

      <div
        ref={dropdownRef}
        className="w-3/4 bg-white flex justify-start items-center p-2 ml-5"
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
