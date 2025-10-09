import { useEffect, useState } from "react";
import {
  getIncomeStatement,
  exportIncomeStatementPDF,
  exportIncomeStatementExcel
} from "../../services/incomeStatementService";

const IncomeStatementPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fromDate, toDate, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getIncomeStatement(fromDate, toDate, page, limit);
      setData(result.data);
      setTotalPages(result.totalPages);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to load income statement");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    const blob = await exportIncomeStatementPDF(fromDate, toDate);
    const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "IncomeStatement.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportExcel = async () => {
    const blob = await exportIncomeStatementExcel(fromDate, toDate);
    const url = window.URL.createObjectURL(new Blob([blob], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "IncomeStatement.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 animate-fade-in">
          📊 Income Statement
        </h1>

        {/* Date Filters & Export Buttons */}
        <div className="flex flex-wrap gap-3 items-center animate-slide-up">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <button
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
          >
            📄 Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Loading/Error */}
      {loading && (
        <div className="p-6 text-center text-gray-500 animate-pulse">
          Loading data...
        </div>
      )}
      {error && (
        <div className="p-6 text-center text-red-600 font-semibold animate-shake">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto shadow-lg rounded-lg animate-fade-in">
          <table className="min-w-full border border-gray-300 bg-white rounded-lg">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 sticky top-0">
              <tr>
                <th className="border px-4 py-2 text-left text-gray-700">Account Name</th>
                <th className="border px-4 py-2 text-left text-gray-700">Account Type</th>
                <th className="border px-4 py-2 text-right text-gray-700">Debit</th>
                <th className="border px-4 py-2 text-right text-gray-700">Credit</th>
                <th className="border px-4 py-2 text-right text-gray-700">Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
              {data.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="border px-4 py-2">{row[1]}</td>
                  <td className="border px-4 py-2">{row[2]}</td>
                  <td className="border px-4 py-2 text-right">{Number(row[3]).toFixed(2)}</td>
                  <td className="border px-4 py-2 text-right">{Number(row[4]).toFixed(2)}</td>
                  <td className="border px-4 py-2 text-right font-semibold text-blue-600">
                    {Number(row[5]).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 gap-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default IncomeStatementPage;
