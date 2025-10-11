import { FaBell, FaSignOutAlt, FaChevronDown, FaBars } from "react-icons/fa";
import { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({ setSidebarOpen }) {
  const { user, logout } = useContext(UserContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Updated here: use PHOTO_URL directly from user
  const profileImage = user?.photo_url
    ? user.photo_url.startsWith("http")
      ? user.photo_url // if full URL from backend
      : `${import.meta.env.VITE_API_URL}/${user.photo_url}` // prepend API URL if relative
    : "/default-avatar.png"; // fallback

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
      
      {/* Left: Mobile Menu + Logo */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <FaBars className="hover:text-yellow-300 transition-colors duration-300" />
        </button>

        <div className="flex items-center gap-2 font-bold text-2xl tracking-wide">
          <img
            src={`/logos/logo.png`}
            alt="Logo"
            className="w-10 h-10 object-contain rounded-md shadow-md"
          />
          <span className="hidden md:block">Accounting ERP</span>
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        {/* <button className="relative group">
          <FaBell className="text-xl hover:text-yellow-300 transition duration-300" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-1 animate-ping">
            3
          </span>
        </button> */}

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-blue-500 p-2 rounded-lg transition duration-300"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img
              src={profileImage}
              alt={user?.empName || "User"}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md transition-transform duration-300 hover:scale-105"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
            <div className="flex flex-col text-sm md:flex">
              <span className="font-semibold">{user?.empName || "Guest"}</span>
              <span className="text-xs">{user?.roleName || "No Role"}</span>
            </div>
            <FaChevronDown
              className={`transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white text-black rounded-lg shadow-xl w-44 animate-fade-in overflow-hidden z-50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-3 w-full hover:bg-gray-100 transition"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
 