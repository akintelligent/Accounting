import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaUsers } from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", to: "/dashboard", icon: <FaTachometerAlt /> },
    { name: "Users", to: "/users", icon: <FaUsers /> },
  ];

  return (
    <aside className="bg-gradient-to-b from-gray-900 to-gray-800 text-white w-64 min-h-screen p-6 flex flex-col transition-all duration-300">
      <h1 className="text-2xl font-bold mb-8">Accounting ERP</h1>
      <ul className="space-y-3 flex-1">
        {menuItems.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-all duration-200 ${
                location.pathname === item.to ? "bg-gray-700 font-semibold" : ""
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-md">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto p-4 text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Accounting ERP
      </div>
    </aside>
  );
}
