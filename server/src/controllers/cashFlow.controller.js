import { getConnection } from "../config/db.js";

export const getCashFlow = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT CASHFLOW_CATEGORY, TOTAL_DEBIT, TOTAL_CREDIT, NET_CASH_FLOW
       FROM VW_CASH_FLOW`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching cash flow:", err);
    res.status(500).json({ message: "Error fetching cash flow statement" });
  } finally {
    if (connection) await connection.close();
  }
};
