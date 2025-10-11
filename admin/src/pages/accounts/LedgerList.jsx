import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLedgerList, getLedgerVoucher } from "../../services/ledgerService";
import { Loader2, FileText, File } from "lucide-react";

export default function LedgerList() {
  const today = new Date().toISOString().split("T")[0];

  const [ledger, setLedger] = useState([]);
  const [filters, setFilters] = useState({ fromDate: today, toDate: "", accountId: "" });
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await getLedgerList(filters);
      setLedger(res.data || []);
      setCurrentPage(1); // reset page after new fetch
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth()+1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = ledger.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(ledger.length / recordsPerPage);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header + Filters */}
      <motion.div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 flex-wrap">
        <motion.h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-blue-600" size={28} /> Ledger Report
        </motion.h2>

        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} className="px-4 py-2 border rounded-lg w-full sm:w-40" />
          <input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} className="px-4 py-2 border rounded-lg w-full sm:w-40" />
          <input type="text" placeholder="Search Account..." value={filters.accountId} onChange={(e) => setFilters({ ...filters, accountId: e.target.value })} className="px-4 py-2 border rounded-lg w-full sm:w-64" />
        </div>
      </motion.div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <AnimatePresence>
            <motion.table initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full text-sm border-collapse">
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
                {currentRecords.length > 0 ? (
                  currentRecords.map((row, i) => (
                    <motion.tr key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-blue-50 transition border-b">
                      <td className="py-2 px-4">{formatDate(row.ENTRY_DATE)}</td>
                      <td className="py-2 px-4 font-semibold">{row.ENTRY_NO}</td>
                      <td className="py-2 px-4">{row.ACCOUNT_NAME}</td>
                      <td className="py-2 px-4">{row.PARTICULARS}</td>
                      <td className="py-2 px-4 text-right text-black">{row.DEBIT}</td>
                      <td className="py-2 px-4 text-right text-black">{row.CREDIT}</td>
                      <td className="py-2 px-4 text-right font-semibold text-gray-700">{row.BALANCE}</td>
                      <td className="py-2 px-4 text-center">
                        <button
                          onClick={() => getLedgerVoucher(row.LEDGER_ID)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          <File size={16} /> Voucher
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-500 py-6 italic">No records found.</td>
                  </tr>
                )}
              </tbody>
            </motion.table>
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {ledger.length > recordsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border ${currentPage === 1 ? "text-gray-400 border-gray-200 cursor-not-allowed" : "text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition"}`}
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border ${currentPage === totalPages ? "text-gray-400 border-gray-200 cursor-not-allowed" : "text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition"}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
