import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getLedgerList,
  getLedgerReport,
  getLedgerVoucher,
} from "../../services/ledgerService";
import { Loader2, FileText, File } from "lucide-react";

export default function LedgerList() {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const [ledger, setLedger] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: today,
    toDate: "",
    accountId: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await getLedgerList(filters);
      setLedger(res.data || []);
    } catch (err) {
      console.error("Ledger fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchLedger, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  const handleReport = async () => {
    try {
      const res = await getLedgerReport(filters);
      const fileURL = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      window.open(fileURL, "_blank");
    } catch (err) {
      console.error("PDF report failed:", err);
    }
  };

  const handleVoucher = async (voucherId) => {
    try {
      const res = await getLedgerVoucher(voucherId);
      const fileURL = URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      window.open(fileURL, "_blank");
    } catch (err) {
      console.error("Voucher PDF failed:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const date = `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
    return date;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2"
      >
        <FileText className="text-blue-600" size={28} /> Ledger Report
      </motion.h2>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center"
      >
        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) =>
            setFilters({ ...filters, fromDate: e.target.value })
          }
          className="px-4 py-2 border rounded-lg w-full sm:w-40"
        />
        <input
          type="date"
          value={filters.toDate}
          onChange={(e) =>
            setFilters({ ...filters, toDate: e.target.value })
          }
          className="px-4 py-2 border rounded-lg w-full sm:w-40"
        />
        <input
          type="text"
          placeholder="Search Account..."
          value={filters.accountId}
          onChange={(e) =>
            setFilters({ ...filters, accountId: e.target.value })
          }
          className="px-4 py-2 border rounded-lg w-full sm:w-64"
        />
        <button
          onClick={handleReport}
          className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
        >
          <FileText size={16} /> PDF Report
        </button>
      </motion.div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <AnimatePresence>
            <motion.table
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full text-sm border-collapse"
            >
              <thead className="bg-blue-600 text-white text-sm uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Entry No</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Particulars</th>
                  <th className="py-3 px-4 text-right">Debit</th>
                  <th className="py-3 px-4 text-right">Credit</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4">Voucher</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length > 0 ? (
                  ledger.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-blue-50 transition border-b"
                    >
                      <td className="py-2 px-4">{formatDate(row[1])}</td>
                      <td className="py-2 px-4 font-semibold">{row[2]}</td>
                      <td className="py-2 px-4">{row[3]}</td>
                      <td className="py-2 px-4">{row[4]}</td>
                      <td className="py-2 px-4 text-right text-green-600">
                        {row[5]}
                      </td>
                      <td className="py-2 px-4 text-right text-red-600">
                        {row[6]}
                      </td>
                      <td className="py-2 px-4 text-right font-semibold text-gray-700">
                        {row[7]}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <button
                          onClick={() => handleVoucher(row[0])}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <File size={16} /> Voucher
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center text-gray-500 py-6 italic"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </motion.table>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
