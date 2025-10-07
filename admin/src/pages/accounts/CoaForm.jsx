import { useEffect, useState } from "react";
import { createAccount, updateAccount, getAccountTree } from "../../services/coaService";
import { motion } from "framer-motion";

const accountTypes = ["Asset", "Liability", "Equity", "Income", "Expense"];

export default function CoaForm({ account, onClose, onSaved }) {
  const [form, setForm] = useState({
    ACCOUNT_NAME: "",
    ACCOUNT_TYPE: "Asset",
    PARENT_ACCOUNT_ID: "",
    STATUS: "A",
    ACCOUNT_CODE: "",
  });
  const [parents, setParents] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch parent account list
    (async () => {
      try {
        const res = await getAccountTree();
        if (res.data?.success) {
          setParents(res.data.data.accounts);
        }
      } catch (err) {
        console.error("Error loading accounts:", err);
      }
    })();

    // Load form if editing
    if (account) {
      setForm({
        ACCOUNT_NAME: account.ACCOUNT_NAME || "",
        ACCOUNT_TYPE: account.ACCOUNT_TYPE || "Asset",
        PARENT_ACCOUNT_ID: account.PARENT_ACCOUNT_ID || "",
        STATUS: account.STATUS || "A",
        ACCOUNT_CODE: account.ACCOUNT_CODE || "",
      });
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (account?.ACCOUNT_ID) {
        await updateAccount(account.ACCOUNT_ID, form);
      } else {
        await createAccount(form);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 overflow-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{account ? "Edit Account" : "New Account"}</h3>
          <button onClick={onClose} className="text-gray-600 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Name */}
          <div>
            <label className="block mb-1 font-medium">Account Name</label>
            <input
              required
              name="ACCOUNT_NAME"
              value={form.ACCOUNT_NAME}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block mb-1 font-medium">Account Type</label>
            <select
              name="ACCOUNT_TYPE"
              value={form.ACCOUNT_TYPE}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              {accountTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Parent Account */}
          <div>
            <label className="block mb-1 font-medium">Parent Account</label>
            <select
              name="PARENT_ACCOUNT_ID"
              value={form.PARENT_ACCOUNT_ID}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- None (Top Level) --</option>
              {parents.map((p) => (
                <option key={p.ACCOUNT_ID} value={p.ACCOUNT_ID}>
                  {"— ".repeat(p.LEVEL_NO - 1)}{p.ACCOUNT_NAME} ({p.ACCOUNT_CODE})
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              name="STATUS"
              value={form.STATUS}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="A">Active</option>
              <option value="I">Inactive</option>
            </select>
          </div>

          {/* Account Code */}
          <div>
            <label className="block mb-1 font-medium">Account Code (Optional)</label>
            <input
              name="ACCOUNT_CODE"
              value={form.ACCOUNT_CODE}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Leave blank to auto-generate"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-400 px-4 py-2 rounded text-white">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="bg-indigo-600 px-4 py-2 rounded text-white">
              {submitting ? "Saving..." : (account ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
