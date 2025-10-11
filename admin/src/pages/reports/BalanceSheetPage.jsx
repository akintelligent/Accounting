import { useEffect, useState } from "react";
import {
  getBalanceSheet,
  exportBalanceSheetPDF,
  exportBalanceSheetExcel
} from "../../services/balanceSheetService";
import { FaSortUp, FaSortDown, FaFilePdf, FaFileExcel } from "react-icons/fa";

const BalanceSheetPage = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [sortField, setSortField] = useState("ACCOUNT_NAME");
  const [sortOrder, setSortOrder] = useState("ASC");

  useEffect(() => {
    loadData();
  }, [fromDate, toDate, page, sortField, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getBalanceSheet(fromDate, toDate, page, pageSize, sortField, sortOrder);
      setData(result.data);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load balance sheet");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortField(field);
      setSortOrder("ASC");
    }
  };

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportPDF = async () => {
    try {
      const blob = await exportBalanceSheetPDF(fromDate, toDate);
      downloadFile(new Blob([blob], { type: "application/pdf" }), "Balance_Sheet.pdf");
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("PDF Export failed!");
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await exportBalanceSheetExcel(fromDate, toDate);
      downloadFile(new Blob([blob], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }), "Balance_Sheet.xlsx");
    } catch (err) {
      console.error("Excel Export Error:", err);
      alert("Excel Export failed!");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-6 animate-fadeIn">
      <div className="flex justify-between flex-wrap items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">📊 Balance Sheet</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <label className="font-medium text-gray-700">From:</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                 className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-300"/>
          <label className="font-medium text-gray-700">To:</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                 className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-300"/>
          <button onClick={handleExportPDF}
                  className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
            <FaFilePdf/> PDF
          </button>
          <button onClick={handleExportExcel}
                  className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
            <FaFileExcel/> Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="p-6 text-red-600 text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th onClick={() => toggleSort("ACCOUNT_NAME")}
                    className="cursor-pointer border px-3 py-2 flex items-center gap-1">
                  Account Name {sortField === "ACCOUNT_NAME" && (sortOrder === "ASC" ? <FaSortUp/> : <FaSortDown/>)}
                </th>
                <th onClick={() => toggleSort("ACCOUNT_TYPE")}
                    className="cursor-pointer border px-3 py-2 flex items-center gap-1">
                  Account Type {sortField === "ACCOUNT_TYPE" && (sortOrder === "ASC" ? <FaSortUp/> : <FaSortDown/>)}
                </th>
                <th className="border px-3 py-2 text-right">Debit</th>
                <th className="border px-3 py-2 text-right">Credit</th>
                <th className="border px-3 py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="border px-3 py-2">{row.ACCOUNT_NAME}</td>
                  <td className="border px-3 py-2">{row.ACCOUNT_TYPE}</td>
                  <td className="border px-3 py-2 text-right">{Number(row.TOTAL_DEBIT || 0).toFixed(2)}</td>
                  <td className="border px-3 py-2 text-right">{Number(row.TOTAL_CREDIT || 0).toFixed(2)}</td>
                  <td className="border px-3 py-2 text-right font-semibold">{Number(row.BALANCE || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <div className="font-medium text-gray-600">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Prev
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetPage;
