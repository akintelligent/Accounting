import {
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaBook,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaLayerGroup
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen, setSidebarOpen }) {
  const menuClass =
    "flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200";

  const activeClass =
    "bg-gray-200 text-blue-600 font-semibold shadow-inner";

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
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:shadow-none`}
      >
        {/* Header with Logo */}
        <div className="flex items-center gap-3 p-4 font-bold text-2xl border-b border-gray-200">
          <img
            src="/logos/logo.png"
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <span>Accounting</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex flex-col gap-4">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${menuClass} ${isActive ? activeClass : ""}`
            }
          >
            <FaTachometerAlt /> Dashboard
          </NavLink>

          {/* Users */}
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `${menuClass} ${isActive ? activeClass : ""}`
            }
          >
            <FaUsers /> Users
          </NavLink>

          {/* Employees */}
          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `${menuClass} ${isActive ? activeClass : ""}`
            }
          >
            <FaUserTie /> Employees
          </NavLink>

          {/* Accounts Section */}
          <div className="mt-4">
            <h3 className="flex items-center gap-2 text-gray-600 uppercase font-bold text-sm mb-2">
              <FaBook /> Accounts
            </h3>
            <div className="flex flex-col gap-2">
              <NavLink
                to="/accounts"
                className={({ isActive }) =>
                  `${menuClass} ${isActive ? activeClass : ""}`
                }
              >
                <FaLayerGroup /> Chart of Accounts (COA)
              </NavLink>
              <NavLink
                to="/journals"
                className={({ isActive }) =>
                  `${menuClass} ${isActive ? activeClass : ""}`
                }
              >
                <FaClipboardList /> Journal List
              </NavLink>
              <NavLink
                to="/ledgers"
                className={({ isActive }) =>
                  `${menuClass} ${isActive ? activeClass : ""}`
                }
              >
                <FaFileInvoiceDollar /> Ledgers
              </NavLink>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
