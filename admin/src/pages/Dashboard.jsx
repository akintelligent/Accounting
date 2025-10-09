import "../utils/chartSetup"; // Register chart components
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/userContext";
import { getDashboardStats } from "../services/dashboardService";
import { Line, Pie } from "react-chartjs-2";
import { FaChartLine, FaBalanceScale, FaMoneyBillWave } from "react-icons/fa";

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        if (data.success) setStats(data.data);
        else setError(data.message);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchStats();
    else setLoading(false);
  }, [user]);

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const cashFlowData = {
    labels: ["Receipts", "Payments"],
    datasets: [
      {
        data: [stats?.totalReceipts, stats?.totalPayments],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const balanceData = {
    labels: ["Assets", "Liabilities"],
    datasets: [
      {
        data: [stats?.totalAssets, stats?.totalLiabilities],
        backgroundColor: ["#4BC0C0", "#FFCE56"],
      },
    ],
  };

  const cashFlowLineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], // You should replace with real months from DB
    datasets: [
      {
        label: "Receipts",
        data: [12000, 15000, 13000, 17000, 14000, 16000],
        borderColor: "green",
        fill: false,
      },
      {
        label: "Payments",
        data: [8000, 9000, 7000, 11000, 9500, 12000],
        borderColor: "red",
        fill: false,
      },
    ],
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* KPI Cards */}
      <div className="bg-indigo-500 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaChartLine /> Total Debit
        </h3>
        <p className="text-3xl font-bold mt-2">{stats?.totalDebit}</p>
      </div>
      <div className="bg-teal-500 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaChartLine /> Total Credit
        </h3>
        <p className="text-3xl font-bold mt-2">{stats?.totalCredit}</p>
      </div>
      <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaBalanceScale /> Total Assets
        </h3>
        <p className="text-3xl font-bold mt-2">{stats?.totalAssets}</p>
      </div>
      <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaBalanceScale /> Total Liabilities
        </h3>
        <p className="text-3xl font-bold mt-2">{stats?.totalLiabilities}</p>
      </div>

      {/* Charts */}
      <div className="col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaMoneyBillWave /> Cash Flow
        </h3>
        <Pie data={cashFlowData} />
      </div>

      <div className="col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaBalanceScale /> Balance Sheet
        </h3>
        <Pie data={balanceData} />
      </div>

      {/* Line Chart for Cash Flow over time */}
      <div className="col-span-4 bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaChartLine /> Monthly Cash Flow
        </h3>
        <Line data={cashFlowLineData} />
      </div>
    </div>
  );
}
