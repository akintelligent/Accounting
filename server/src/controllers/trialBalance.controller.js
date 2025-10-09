import { getConnection } from "../config/db.js";

export const getTrialBalance = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT ACCOUNT_ID, ACCOUNT_NAME, TOTAL_DEBIT, TOTAL_CREDIT, BALANCE
       FROM VW_TRIAL_BALANCE
       ORDER BY ACCOUNT_NAME`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching trial balance:", err);
    res.status(500).json({ message: "Error fetching trial balance" });
  } finally {
    if (connection) await connection.close();
  }
};
