// JournalList.jsx
import { useEffect, useState } from "react";
import { getJournalEntries, deleteJournalEntry, postJournalEntry } from "../../services/journalService";
import JournalForm from "./JournalForm";
import { motion, AnimatePresence } from "framer-motion";

export default function JournalList() {
  const [entries, setEntries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const fetch = async () => {
    try {
      const res = await getJournalEntries();
      if (res.data.success) setEntries(res.data.data.entries);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetch(); }, []);

  const handleNew = () => { setEditing(null); setOpenForm(true); };
  const handleEdit = (e) => { setEditing(e); setOpenForm(true); };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this draft?")) return;
    await deleteJournalEntry(id);
    fetch();
  };

  const handlePost = async (id) => {
    if (!window.confirm("Are you sure you want to post this entry?")) return;
    try {
      await postJournalEntry(id);
      alert("Entry posted successfully");
      fetch();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error posting entry");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Journal Entries</h2>
        <button onClick={handleNew} className="bg-indigo-600 text-white px-4 py-2 rounded">+ New</button>
      </div>

      <div className="bg-white shadow rounded">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Voucher</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {entries.map((en) => (
                <motion.tr key={en.ENTRY_ID} initial={{opacity:0}} animate={{opacity:1}}>
                  <td className="px-4 py-2">{en.ENTRY_NO}</td>
                  <td className="px-4 py-2">{new Date(en.ENTRY_DATE).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{en.VOUCHER_TYPE}</td>
                  <td className="px-4 py-2">{en.DESCRIPTION}</td>
                  <td className="px-4 py-2">{en.STATUS === "P" ? "Posted" : "Draft"}</td>
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

      {openForm && (
        <JournalForm
          entry={editing}
          onClose={() => { setOpenForm(false); setEditing(null); }}
          onSaved={() => { setOpenForm(false); fetch(); }}
        />
      )}
    </div>
  );
}
