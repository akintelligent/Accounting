import { useEffect, useState } from "react";
import {
  createJournalEntry,
  updateJournalEntry,
  postJournalEntry,
  getJournalEntry,
} from "../../services/journalService";
import { getAccounts } from "../../services/coaService";

export default function JournalForm({ entry, onClose, onSaved }) {
  const [form, setForm] = useState({
    ENTRY_DATE: new Date().toISOString().slice(0, 10),
    VOUCHER_TYPE: "Journal",
    DESCRIPTION: "",
    CREATED_BY: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).username : "system",
    lines: [
      { ACCOUNT_ID: "", NARRATION: "", DEBIT: 0, CREDIT: 0 },
      { ACCOUNT_ID: "", NARRATION: "", DEBIT: 0, CREDIT: 0 },
    ],
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const a = await getAccounts();
      if (a.data.success) setAccounts(a.data.data.accounts);

      if (entry?.ENTRY_ID) {
        const res = await getJournalEntry(entry.ENTRY_ID);
        if (res.data.success) {
          const e = res.data.data.entry;
          setForm({
            ENTRY_DATE: new Date(e.ENTRY_DATE).toISOString().slice(0, 10),
            VOUCHER_TYPE: e.VOUCHER_TYPE || "Journal",
            DESCRIPTION: e.DESCRIPTION || "",
            CREATED_BY: e.CREATED_BY || form.CREATED_BY,
            lines: e.lines.length ? e.lines.map(l => ({
              ACCOUNT_ID: l.ACCOUNT_ID,
              NARRATION: l.NARRATION,
              DEBIT: Number(l.DEBIT || 0),
              CREDIT: Number(l.CREDIT || 0),
            })) : form.lines
          });
        }
      }
    })();
    // eslint-disable-next-line
  }, [entry]);

  const handleLineChange = (idx, field, value) => {
    const cloned = [...form.lines];
    cloned[idx] = {
      ...cloned[idx],
      [field]: field === "ACCOUNT_ID" ? Number(value) : (field === "DEBIT" || field === "CREDIT" ? Number(value) : value)
    };
    setForm({ ...form, lines: cloned });
  };

  const addLine = () => setForm({ ...form, lines: [...form.lines, { ACCOUNT_ID: "", NARRATION: "", DEBIT: 0, CREDIT: 0 }] });
  const removeLine = (i) => setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });

  const totalDebit = form.lines.reduce((s, l) => s + (Number(l.DEBIT) || 0), 0);
  const totalCredit = form.lines.reduce((s, l) => s + (Number(l.CREDIT) || 0), 0);

  const save = async (postAfter = false) => {
    if (totalDebit.toFixed(2) !== totalCredit.toFixed(2)) {
      alert("Total Debit and Credit must be equal.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ENTRY_DATE: form.ENTRY_DATE,
        VOUCHER_TYPE: form.VOUCHER_TYPE,
        DESCRIPTION: form.DESCRIPTION,
        CREATED_BY: form.CREATED_BY,
        lines: form.lines,
      };
      let entryId;
      if (entry?.ENTRY_ID) {
        await updateJournalEntry(entry.ENTRY_ID, payload);
        entryId = entry.ENTRY_ID;
      } else {
        const res = await createJournalEntry(payload);
        entryId = res.data.data.entryId;
      }

      if (postAfter) {
        await postJournalEntry(entryId);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{entry ? `Edit ${entry.ENTRY_NO || ''}` : "New Journal Entry"}</h3>
          <button onClick={onClose} className="text-gray-600">&times;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-sm">Date</label>
            <input type="date" value={form.ENTRY_DATE} onChange={(e) => setForm({ ...form, ENTRY_DATE: e.target.value })} className="w-full border px-2 py-1 rounded" />
          </div>
          <div>
            <label className="block text-sm">Voucher Type</label>
            <select value={form.VOUCHER_TYPE} onChange={(e) => setForm({ ...form, VOUCHER_TYPE: e.target.value })} className="w-full border px-2 py-1 rounded">
              <option>Journal</option>
              <option>Payment</option>
              <option>Receipt</option>
              <option>Contra</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Created By</label>
            <input value={form.CREATED_BY} readOnly className="w-full border px-2 py-1 rounded bg-gray-50" />
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm">Description</label>
          <input value={form.DESCRIPTION} onChange={(e) => setForm({ ...form, DESCRIPTION: e.target.value })} className="w-full border px-2 py-1 rounded" />
        </div>

        <div className="mb-4">
          <table className="w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2">Account</th>
                <th className="p-2">Narration</th>
                <th className="p-2">Debit</th>
                <th className="p-2">Credit</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {form.lines.map((ln, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">
                    <select value={ln.ACCOUNT_ID || ""} onChange={(e) => handleLineChange(idx, "ACCOUNT_ID", e.target.value)} className="w-full border px-2 py-1 rounded">
                      <option value="">-- select account --</option>
                      {accounts.map(a => <option key={a.ACCOUNT_ID} value={a.ACCOUNT_ID}>{a.ACCOUNT_NAME} ({a.ACCOUNT_CODE})</option>)}
                    </select>
                  </td>
                  <td className="p-2"><input value={ln.NARRATION} onChange={(e) => handleLineChange(idx, "NARRATION", e.target.value)} className="w-full border px-2 py-1 rounded" /></td>
                  <td className="p-2"><input type="number" step="0.01" value={ln.DEBIT} onChange={(e) => handleLineChange(idx, "DEBIT", e.target.value)} className="w-full border px-2 py-1 rounded" /></td>
                  <td className="p-2"><input type="number" step="0.01" value={ln.CREDIT} onChange={(e) => handleLineChange(idx, "CREDIT", e.target.value)} className="w-full border px-2 py-1 rounded" /></td>
                  <td className="p-2">
                    <button type="button" onClick={() => removeLine(idx)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="p-2"><button type="button" onClick={addLine} className="bg-green-500 text-white px-3 py-1 rounded">+ Add Line</button></td>
                <td className="p-2 text-right font-semibold">Totals:</td>
                <td className="p-2 font-semibold">{totalDebit.toFixed(2)}</td>
                <td className="p-2 font-semibold">{totalCredit.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
          <button onClick={() => save(false)} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">{loading ? "Saving..." : "Save"}</button>
          <button onClick={() => save(true)} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">{loading ? "Processing..." : "Save & Post"}</button>
        </div>
      </div>
    </div>
  );
}
