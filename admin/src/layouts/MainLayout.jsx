import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Area */}
      <div className="flex flex-col flex-1">
        {/* Navbar (fixed height) */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* Main Content (scrolls only here) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
