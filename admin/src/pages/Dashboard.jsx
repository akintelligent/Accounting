import "../utils/chartSetup"; // Chart.js elements registered
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/userContext";
import { getDashboardStats } from "../services/dashboardService";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  FaChartLine,
  FaBalanceScale,
  FaMoneyBillWave,
  FaChartBar,
} from "react-icons/fa";

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

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-gray-500 animate-pulse">
        Loading dashboard...
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-red-500 text-center font-semibold">{error}</div>
    );

  // Pie Charts
  const cashFlowData = {
    labels: ["Receipts", "Payments"],
    datasets: [
      {
        data: [stats?.totalReceipts || 0, stats?.totalPayments || 0],
        backgroundColor: ["#4ade80", "#f87171"],
        hoverOffset: 10,
      },
    ],
  };

  const balanceData = {
    labels: ["Assets", "Liabilities"],
    datasets: [
      {
        data: [stats?.totalAssets || 0, stats?.totalLiabilities || 0],
        backgroundColor: ["#22d3ee", "#facc15"],
        hoverOffset: 10,
      },
    ],
  };

  // Bar Chart with Gradient
  const incomeExpenseData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount",
        data: [stats?.totalIncome || 0, stats?.totalExpense || 0],
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "#3b82f6");
          gradient.addColorStop(1, "#22c55e");
          return gradient;
        },
        borderRadius: 12,
      },
    ],
  };

  // Line Chart
  const cashFlowLineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Receipts",
        data: [12000, 15000, 13000, 17000, 14000, 16000],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: "Payments",
        data: [8000, 9000, 7000, 11000, 9500, 12000],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  // Chart Options
  const commonChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { font: { weight: "bold" } } },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ctx.parsed.y ? `৳ ${ctx.parsed.y.toLocaleString()}` : ctx.raw,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* KPI Cards */}
      {[
        {
          title: "Total Debit",
          value: stats?.totalDebit,
          icon: <FaChartLine size={24} />,
          bg: "bg-indigo-500",
        },
        {
          title: "Total Credit",
          value: stats?.totalCredit,
          icon: <FaChartLine size={24} />,
          bg: "bg-teal-500",
        },
        {
          title: "Total Assets",
          value: stats?.totalAssets,
          icon: <FaBalanceScale size={24} />,
          bg: "bg-green-500",
        },
        {
          title: "Total Liabilities",
          value: stats?.totalLiabilities,
          icon: <FaBalanceScale size={24} />,
          bg: "bg-red-500",
        },
      ].map((card, idx) => (
        <div
          key={idx}
          className={`flex flex-col justify-between ${card.bg} text-white p-6 rounded-xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl`}
        >
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            {card.icon} {card.title}
          </h3>
          <p className="text-3xl font-bold mt-2 animate-pulse">{card.value || 0}</p>
        </div>
      ))}

      {/* Cash Flow Pie */}
      <div className="col-span-2 bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaMoneyBillWave /> Cash Flow
        </h3>
        <div className="h-72">
          <Pie data={cashFlowData} options={commonChartOptions} />
        </div>
      </div>

      {/* Balance Sheet Pie */}
      <div className="col-span-2 bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaBalanceScale /> Balance Sheet
        </h3>
        <div className="h-72">
          <Pie data={balanceData} options={commonChartOptions} />
        </div>
      </div>

      {/* Bar + Line Charts Row */}
      <div className="col-span-2 bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaChartBar /> Income vs Expense
        </h3>
        <div className="h-72">
          <Bar data={incomeExpenseData} options={commonChartOptions} />
        </div>
      </div>

      <div className="col-span-2 bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaChartLine /> Monthly Cash Flow
        </h3>
        <div className="h-72">
          <Line data={cashFlowLineData} options={commonChartOptions} />
        </div>
      </div>
    </div>
  );
}
