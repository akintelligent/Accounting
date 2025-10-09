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

  // default: last 7 days
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
      console.log("📡 Fetching entries with params:", params);
      const res = await getJournalEntries(params);
      console.log("🔁 API response:", res?.data);
      // handle different possible response shapes
      if (res?.data?.success && res.data.data?.entries) {
        setEntries(res.data.data.entries);
      } else if (Array.isArray(res?.data)) {
        setEntries(res.data);
      } else if (res?.data?.entries) {
        setEntries(res.data.entries);
      } else {
        // fallback: try to set empty
        setEntries([]);
      }
    } catch (err) {
      console.error("❌ fetchEntries error:", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // initial load (use default from/to)
  useEffect(() => {
    fetchEntries({ from: sevenDaysAgoStr, to: todayStr });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounced filter function
  const debouncedFilter = useCallback(
    debounce((s, f, t) => {
      fetchEntries({ search: s || undefined, from: f || undefined, to: t || undefined });
    }, 400),
    []
  );

  useEffect(() => {
    console.log("🌀 Filter changed:", { search, from, to });
    debouncedFilter(search, from, to);
    // cleanup on unmount: cancel pending debounce
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Journal Entries</h2>
        <button onClick={handleNew} className="bg-indigo-600 text-white px-4 py-2 rounded">
          + New
        </button>
      </div>

      {/* Filters (no button) */}
      <div className="flex flex-wrap items-end gap-3 bg-gray-50 p-3 rounded mb-4">
        <div>
          <label className="block text-sm font-medium">From</label>
          <input type="date" {...register("from")} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">To</label>
          <input type="date" {...register("to")} className="border rounded px-2 py-1" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Search</label>
          <input
            type="text"
            placeholder="Search voucher, type, or description..."
            {...register("search")}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Loading / No data */}
      {loading && <div className="mb-2 text-sm text-gray-600">Loading...</div>}
      {!loading && entries.length === 0 && (
        <div className="mb-2 text-sm text-gray-600">No entries found for selected filter.</div>
      )}

      {/* Table */}
      <div className="bg-white shadow rounded overflow-auto">
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
              {entries.map((en) => (
                <motion.tr key={en.ENTRY_ID} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className="px-4 py-2">{en.ENTRY_NO}</td>
                  <td className="px-4 py-2">{new Date(en.ENTRY_DATE).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{en.VOUCHER_TYPE}</td>
                  <td className="px-4 py-2">{en.DESCRIPTION}</td>
                  <td className="px-4 py-2">
                    {en.STATUS === "P" ? <span className="text-green-600 font-medium">Posted</span> : <span className="text-gray-600">Draft</span>}
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

      {/* Form Modal */}
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
