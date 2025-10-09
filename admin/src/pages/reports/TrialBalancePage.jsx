import { useEffect, useState } from "react";
import { getTrialBalance } from "../../services/trialBalanceService";

const TrialBalancePage = () => {
  const [data, setData] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadPDF = () => {
  window.open("http://localhost:4000/api/trial-balance/report", "_blank");
  };
  const handleDownloadExcel = () => {
    window.open("http://localhost:4000/api/trial-balance/report/excel", "_blank");
  };  



  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getTrialBalance();
      setData(result);

      // ✅ Calculate totals safely
      const debitSum = result.reduce(
        (sum, row) => sum + Number(row.TOTAL_DEBIT || row[2] || 0),
        0
      );
      const creditSum = result.reduce(
        (sum, row) => sum + Number(row.TOTAL_CREDIT || row[3] || 0),
        0
      );

      setTotalDebit(debitSum);
      setTotalCredit(creditSum);
      setError(null);
    } catch (err) {
      console.error("Error loading trial balance:", err);
      setError("Failed to load trial balance data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="p-6 text-gray-500">Loading Trial Balance...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-700">Trial Balance Report</h1>
        <button
          className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
          onClick={handleDownloadPDF}
        >
          📄 Export PDF
        </button>
        <button
          className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm ml-2"
          onClick={handleDownloadExcel}
        >
          📊 Export Excel
        </button>


      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm border-gray-300">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-3 py-2 text-left w-1/2">Account Name</th>
              <th className="border px-3 py-2 text-right w-1/6">Debit</th>
              <th className="border px-3 py-2 text-right w-1/6">Credit</th>
              <th className="border px-3 py-2 text-right w-1/6">Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const debit = Number(row.TOTAL_DEBIT || row[2] || 0);
              const credit = Number(row.TOTAL_CREDIT || row[3] || 0);
              const balance = Number(row.BALANCE || row[4] || debit - credit);

              return (
                <tr
                  key={i}
                  className={`hover:bg-gray-50 ${
                    balance < 0 ? "text-red-600" : ""
                  }`}
                >
                  <td className="border px-3 py-2">{row.ACCOUNT_NAME || row[1]}</td>
                  <td className="border px-3 py-2 text-right">
                    {debit.toFixed(2)}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    {credit.toFixed(2)}
                  </td>
                  <td className="border px-3 py-2 text-right font-medium">
                    {balance.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-100 font-semibold">
            <tr>
              <td className="border px-3 py-2 text-right">Total:</td>
              <td className="border px-3 py-2 text-right">
                {totalDebit.toFixed(2)}
              </td>
              <td className="border px-3 py-2 text-right">
                {totalCredit.toFixed(2)}
              </td>
              <td className="border px-3 py-2 text-right">
                {(totalDebit - totalCredit).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TrialBalancePage;
