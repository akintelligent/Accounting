import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import UserList from "../pages/user/UserList";
import Login from "../pages/auth/Login";
import EmployeeList from "../pages/employee/EmployeeList";
import EmployeeForm from "../pages/employee/EmployeeForm";
import EmployeeDetailsPage from "../pages/employee/EmployeeDetailsPage";
import CoaList from "../pages/accounts/CoaList";
import CoaTree from "../pages/accounts/CoaTree";
import JournalList from "../pages/accounts/JournalList";
import LedgerList from "../pages/accounts/LedgerList";
import TrialBalancePage from "../pages/reports/TrialBalancePage";
import IncomeStatementPage from "../pages/reports/IncomeStatementPage";
import BalanceSheetPage from "../pages/reports/BalanceSheetPage";
import CashFlowPage from "../pages/reports/CashFlowPage";

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
        <Route path="journals" element={<JournalList />} />
        <Route path="accounts" element={<CoaList />} />
        <Route path="accounts/tree" element={<CoaTree />} />
        <Route path="ledgers" element={<LedgerList />} />
        <Route path="reports/trial-balance" element={<TrialBalancePage />} />
        <Route path="reports/income-statement" element={<IncomeStatementPage />} />
        <Route path="reports/balance-sheet" element={<BalanceSheetPage />} />
        <Route path="reports/cash-flow" element={<CashFlowPage />} />

        {/* <Route path="coa/add" element={<CoaForm />} /> */}
      </Route>
    </Routes>
  );
}
