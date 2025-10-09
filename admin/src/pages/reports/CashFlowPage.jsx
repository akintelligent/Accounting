import { useEffect, useState } from "react";
import { getCashFlow } from "../../services/cashFlowService";

const CashFlowPage = () => {
  const [data, setData] = useState([]);
  const [totalCashFlow, setTotalCashFlow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getCashFlow();
      setData(result);

      const total = result.reduce(
        (sum, row) => sum + Number(row[3] || 0),
        0
      );

      setTotalCashFlow(total);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load cash flow statement.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading Cash Flow...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Cash Flow Statement</h1>

      <table className="min-w-full border text-sm border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Cash Flow Category</th>
            <th className="border px-3 py-2 text-right">Debit</th>
            <th className="border px-3 py-2 text-right">Credit</th>
            <th className="border px-3 py-2 text-right">Net Cash Flow</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{row[0]}</td>
              <td className="border px-3 py-2 text-right">
                {Number(row[1]).toFixed(2)}
              </td>
              <td className="border px-3 py-2 text-right">
                {Number(row[2]).toFixed(2)}
              </td>
              <td className="border px-3 py-2 text-right font-semibold">
                {Number(row[3]).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-100 font-semibold">
          <tr>
            <td colSpan={3} className="border px-3 py-2 text-right">
              Net Cash Flow:
            </td>
            <td className="border px-3 py-2 text-right">
              {totalCashFlow.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default CashFlowPage;
