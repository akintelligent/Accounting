import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import UserList from "../pages/user/UserList";
import Login from "../pages/auth/Login";
import EmployeeList from "../pages/employee/EmployeeList";
import EmployeeForm from "../pages/employee/EmployeeForm";
import EmployeeDetailsPage from "../pages/employee/EmployeeDetailsPage";
import CoaList from "../pages/accounts/CoaList";
import CoaForm from "../pages/accounts/CoaForm";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Nested routes inside MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserList />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/add" element={<EmployeeForm />} />
        <Route path="employees/:id" element={<EmployeeDetailsPage />} />
        <Route path="accounts" element={<CoaList />} />
        {/* <Route path="coa/add" element={<CoaForm />} /> */}
      </Route>
    </Routes>
  );
}
