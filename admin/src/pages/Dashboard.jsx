import { getDashboardStats } from "../services/dashboardService";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/userContext";
import { FaUsers, FaUserTie } from "react-icons/fa";

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

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-indigo-500 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold">Total Users</h3>
        <p className="text-3xl font-bold mt-2">{stats?.totalUsers}</p>
      </div>
      <div className="bg-teal-500 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold">Total Employees</h3>
        <p className="text-3xl font-bold mt-2">{stats?.totalEmployees}</p>
      </div>
    </div>
  );
}
