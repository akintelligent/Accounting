import { useEffect, useState } from "react";
import { getAccounts, deleteAccount } from "../../services/coaService";
import CoaForm from "./CoaForm";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  PlusCircle,
  TreePine,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function CoaList() {
  const [accounts, setAccounts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      const res = await getAccounts();
      if (res.data.success) setAccounts(res.data.data.accounts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setOpenModal(true);
  };

  const handleEdit = (acc) => {
    setEditing(acc);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    await deleteAccount(id);
    fetch();
  };

  const handleTreeView = () => {
    navigate("/accounts/tree");
  };

  // ✅ Filter + Pagination Logic
  const filteredAccounts = accounts.filter((acc) => {
    const term = searchTerm.toLowerCase();
    return (
      acc.ACCOUNT_NAME.toLowerCase().includes(term) ||
      acc.ACCOUNT_TYPE.toLowerCase().includes(term) ||
      acc.ACCOUNT_CODE?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredAccounts.length / rowsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const changePage = (direction) => {
    setCurrentPage((prev) => {
      if (direction === "next" && prev < totalPages) return prev + 1;
      if (direction === "prev" && prev > 1) return prev - 1;
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8 transition-all">
      {/* ===== Header: Title + Search + Buttons (Same Row) ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 flex-wrap"
      >
        {/* Left: Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight whitespace-nowrap">
          🧾 Chart of Accounts
        </h1>

        {/* Middle: Search */}
        <div className="relative w-full sm:w-72 md:w-80 lg:w-96">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by name, type, or code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
          />
        </div>

        {/* Right: Buttons */}
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <PlusCircle size={18} /> Add New
          </button>
          <button
            onClick={handleTreeView}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <TreePine size={18} /> Tree View
          </button>
        </div>
      </motion.div>

      {/* ===== Table Section ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden"
      >
        <table className="w-full text-sm sm:text-base">
          <thead className="bg-indigo-600 text-white">
            <tr>
              {["Code", "Name", "Type", "Parent", "Level", "Status", "Actions"].map(
                (col) => (
                  <th key={col} className="px-4 py-3 text-left font-semibold">
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedAccounts.length > 0 ? (
                paginatedAccounts.map((acc, index) => (
                  <motion.tr
                    key={acc.ACCOUNT_ID}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <td className="px-4 py-3 font-medium">{acc.ACCOUNT_CODE}</td>
                    <td className="px-4 py-3">{acc.ACCOUNT_NAME}</td>
                    <td className="px-4 py-3">{acc.ACCOUNT_TYPE}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {acc.PARENT_ACCOUNT_ID || "-"}
                    </td>
                    <td className="px-4 py-3">{acc.LEVEL_NO}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          acc.STATUS === "A"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {acc.STATUS === "A" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(acc)}
                          className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-md transition-all"
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(acc.ACCOUNT_ID)}
                          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-all"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-6 text-gray-500 dark:text-gray-400 italic"
                  >
                    No accounts found
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      {/* ===== Pagination ===== */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <button
            onClick={() => changePage("prev")}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <span className="px-4 py-1 text-gray-600 dark:text-gray-300 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => changePage("next")}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ===== Modal ===== */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg"
            >
              <CoaForm
                account={editing}
                onClose={() => {
                  setOpenModal(false);
                  setEditing(null);
                }}
                onSaved={() => {
                  setOpenModal(false);
                  fetch();
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
