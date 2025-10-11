import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import debounce from "lodash.debounce";
import { motion, AnimatePresence } from "framer-motion";
import {
  getJournalEntries,
  deleteJournalEntry,
  postJournalEntry,
} from "../../services/journalService";
import JournalForm from "./JournalForm";

export default function JournalList() {
  const [entries, setEntries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  const { register, watch } = useForm({
    defaultValues: {
      search: "",
      from: sevenDaysAgoStr,
      to: todayStr,
    },
  });

  const search = watch("search");
  const from = watch("from");
  const to = watch("to");

  const fetchEntries = async (params = {}) => {
    try {
      setLoading(true);
      const res = await getJournalEntries(params);
      if (res?.data?.success && res.data.data?.entries) {
        setEntries(res.data.data.entries);
      } else if (Array.isArray(res?.data)) {
        setEntries(res.data);
      } else if (res?.data?.entries) {
        setEntries(res.data.entries);
      } else {
        setEntries([]);
      }
      setCurrentPage(1);
    } catch (err) {
      console.error("❌ fetchEntries error:", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries({ from: sevenDaysAgoStr, to: todayStr });
  }, []);

  const debouncedFilter = useCallback(
    debounce((s, f, t) => {
      fetchEntries({ search: s || undefined, from: f || undefined, to: t || undefined });
    }, 400),
    []
  );

  useEffect(() => {
    debouncedFilter(search, from, to);
    return () => {
      debouncedFilter.cancel();
    };
  }, [search, from, to, debouncedFilter]);

  const handleNew = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (entry) => {
    setEditing(entry);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this draft?")) return;
    try {
      await deleteJournalEntry(id);
      fetchEntries({ search, from, to });
    } catch (err) {
      console.error(err);
      alert("Error deleting entry");
    }
  };

  const handlePost = async (id) => {
    if (!window.confirm("Are you sure you want to post this entry?")) return;
    try {
      await postJournalEntry(id);
      alert("Entry posted successfully");
      fetchEntries({ search, from, to });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error posting entry");
    }
  };

  // Pagination
  const totalPages = Math.ceil(entries.length / recordsPerPage);
  const currentRecords = entries.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="p-6">
      {/* Modern Single-row Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 flex-wrap">
        {/* Left: Title + Date Pickers */}
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-3xl font-extrabold text-gray-800">Journal Entries</h2>
          <div className="flex gap-2 items-center">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">From</label>
              <input
                type="date"
                {...register("from")}
                className="mt-1 px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">To</label>
              <input
                type="date"
                {...register("to")}
                className="mt-1 px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Right: Search + New Button */}
        <div className="flex items-center gap-3 flex-1 md:flex-auto">
          <div className="flex-1 flex flex-col">
            <label className="text-sm font-medium text-gray-600">Search</label>
            <input
              type="text"
              placeholder="Voucher, Type, Description..."
              {...register("search")}
              className="mt-1 px-4 py-2 rounded-xl shadow-sm border focus:ring-2 focus:ring-indigo-400 focus:outline-none transition placeholder-gray-400 w-full"
            />
          </div>
          <button
            onClick={handleNew}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-indigo-700 hover:scale-105 transition transform font-semibold"
          >
            + New Entry
          </button>
        </div>
      </div>

      {/* Loading / No Data */}
      {loading && <div className="mb-2 text-sm text-gray-600">Loading...</div>}
      {!loading && entries.length === 0 && (
        <div className="mb-2 text-sm text-gray-600">No entries found for selected filter.</div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-white shadow rounded overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Voucher</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {currentRecords.map((en) => (
                <motion.tr key={en.ENTRY_ID} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className="px-4 py-2">{en.ENTRY_NO}</td>
                  <td className="px-4 py-2">{new Date(en.ENTRY_DATE).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{en.VOUCHER_TYPE}</td>
                  <td className="px-4 py-2">{en.DESCRIPTION}</td>
                  <td className="px-4 py-2">
                    {en.STATUS === "P" ? (
                      <span className="text-green-600 font-medium">Posted</span>
                    ) : (
                      <span className="text-gray-600">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => handleEdit(en)} className="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                    {en.STATUS !== "P" && (
                      <>
                        <button onClick={() => handleDelete(en.ENTRY_ID)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                        <button onClick={() => handlePost(en.ENTRY_ID)} className="bg-green-500 text-white px-2 py-1 rounded">Post</button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        <AnimatePresence>
          {currentRecords.map((en) => (
            <motion.div
              key={en.ENTRY_ID}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-md rounded-xl p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">{en.ENTRY_NO}</span>
                <span className="text-sm text-gray-500">{new Date(en.ENTRY_DATE).toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-gray-700 mb-1">Type: {en.VOUCHER_TYPE}</div>
              <div className="text-sm text-gray-700 mb-1">Desc: {en.DESCRIPTION}</div>
              <div className="mb-2">
                Status: {en.STATUS === "P" ? <span className="text-green-600 font-medium">Posted</span> : <span className="text-gray-600">Draft</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleEdit(en)} className="bg-yellow-400 px-3 py-1 rounded text-sm">Edit</button>
                {en.STATUS !== "P" && (
                  <>
                    <button onClick={() => handleDelete(en.ENTRY_ID)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                    <button onClick={() => handlePost(en.ENTRY_ID)} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Post</button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {entries.length > recordsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
            } transition`}
          >
            Previous
          </button>

          <span className="text-gray-600">
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
            } transition`}
          >
            Next
          </button>
        </div>
      )}

      {openForm && (
        <JournalForm
          entry={editing}
          onClose={() => {
            setOpenForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setOpenForm(false);
            fetchEntries({ search, from, to });
          }}
        />
      )}
    </div>
  );
}
