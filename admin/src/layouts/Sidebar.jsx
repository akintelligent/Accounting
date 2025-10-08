import { FaTachometerAlt, FaUsers, FaUserTie, FaBars } from "react-icons/fa";
import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen, setSidebarOpen }) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40 transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:shadow-none`}
      >
        <div className="p-4 font-bold text-2xl border-b border-gray-200">
          Accounting ERP
        </div>
        <nav className="p-4 flex flex-col gap-2">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
          >
            <FaTachometerAlt /> Dashboard
          </NavLink>
          <NavLink
            to="/users"
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
          >
            <FaUsers /> Users
          </NavLink>
          <NavLink
            to="/employees"
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
          >
            <FaUserTie /> Employees
          </NavLink>
          <NavLink
            to="/accounts"
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-200"
          >
            <FaUserTie /> COA
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
