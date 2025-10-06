import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import UserList from "../pages/user/UserList";
import Login from "../pages/auth/Login";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Nested routes inside MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserList />} />
      </Route>
    </Routes>
  );
}
