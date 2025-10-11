import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // ✅ Add this
  Title,
  Tooltip,
  Legend,
  ArcElement, // ✅ For Pie Chart
} from "chart.js";

// ✅ Register all chart elements globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // ✅ Register bar
  ArcElement, // ✅ Register pie
  Title,
  Tooltip,
  Legend
);
