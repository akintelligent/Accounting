import { useEffect, useState } from "react";
import { getAccounts, deleteAccount } from "../../services/coaService";
import CoaForm from "./CoaForm";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react"; // ✅ for search icon

export default function CoaList() {
  const [accounts, setAccounts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ search state
  const navigate = useNavigate();

  // ✅ Fetch Accounts
  const fetch = async () => {
    try {
      const res = await getAccounts();
      if (res.data.success) {
        setAccounts(res.data.data.accounts);
      }
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
    if (!window.confirm("Delete this account?")) return;
    await deleteAccount(id);
    fetch();
  };

  const handleTreeView = () => {
    navigate("/accounts/tree");
  };

  // ✅ Filter Logic
  const filteredAccounts = accounts.filter((acc) => {
    const term = searchTerm.toLowerCase();
    return (
      acc.ACCOUNT_NAME.toLowerCase().includes(term) ||
      acc.ACCOUNT_TYPE.toLowerCase().includes(term) ||
      acc.ACCOUNT_CODE?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
          >
            + New Account
          </button>
          <button
            onClick={handleTreeView}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            🌳 Tree View
          </button>
        </div>
      </div>

      {/* ✅ Search Box */}
      <div className="relative mb-4 max-w-sm">
        <Search
          size={18}
          className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by name, type or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Code</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Parent</th>
              <th className="px-4 py-2 text-left">Level</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => (
                  <motion.tr
                    key={acc.ACCOUNT_ID}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="px-4 py-2">{acc.ACCOUNT_CODE}</td>
                    <td className="px-4 py-2">{acc.ACCOUNT_NAME}</td>
                    <td className="px-4 py-2">{acc.ACCOUNT_TYPE}</td>
                    <td className="px-4 py-2">{acc.PARENT_ACCOUNT_ID || "-"}</td>
                    <td className="px-4 py-2">{acc.LEVEL_NO}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-white text-sm ${
                          acc.STATUS === "A"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {acc.STATUS === "A" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(acc)}
                        className="bg-yellow-400 px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(acc.ACCOUNT_ID)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center text-gray-500 py-4 italic"
                  >
                    No accounts found
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {openModal && (
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
      )}
    </div>
  );
}
