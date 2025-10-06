import { FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useContext(UserContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // go to login page
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-lg">
      <div className="font-bold text-xl">Accounting ERP</div>

      <div className="flex items-center gap-6">
        {/* Notification */}
        <button className="relative">
          <FaBell className="text-xl hover:text-yellow-300 transition" />
          <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full px-1">3</span>
        </button>

        {/* User Info with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-blue-500 p-2 rounded-lg transition"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <FaUserCircle className="text-2xl" />
            <div className="flex flex-col text-sm">
              <span className="font-medium">
                {user ? user.empName : "Guest"}
              </span>
              <span className="text-xs">
                {user ? user.roleName || "No Role" : ""}
              </span>
            </div>
          </div>

          {isDropdownOpen && user && (
            <div className="absolute top-full right-0 mt-2 bg-white text-black rounded shadow-lg w-32 z-10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-2 w-full hover:bg-gray-200"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
