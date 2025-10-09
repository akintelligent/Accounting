import { getConnection } from "../config/db.js";

export const getIncomeStatement = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const { fromDate, toDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await connection.execute(
      `SELECT ACCOUNT_ID, ACCOUNT_NAME, ACCOUNT_TYPE, TOTAL_DEBIT, TOTAL_CREDIT, NET_AMOUNT
       FROM VW_INCOME_STATEMENT
       WHERE (:fromDate IS NULL OR ENTRY_DATE >= TO_DATE(:fromDate, 'YYYY-MM-DD'))
       AND (:toDate IS NULL OR ENTRY_DATE <= TO_DATE(:toDate, 'YYYY-MM-DD'))
       ORDER BY ACCOUNT_TYPE, ACCOUNT_NAME
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { fromDate, toDate, offset: Number(offset), limit: Number(limit) }
    );

    const countResult = await connection.execute(
      `SELECT COUNT(*) FROM VW_INCOME_STATEMENT
       WHERE (:fromDate IS NULL OR ENTRY_DATE >= TO_DATE(:fromDate, 'YYYY-MM-DD'))
       AND (:toDate IS NULL OR ENTRY_DATE <= TO_DATE(:toDate, 'YYYY-MM-DD'))`,
      { fromDate, toDate }
    );

    const totalRecords = countResult.rows[0][0];
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      data: result.rows,
      page: Number(page),
      totalPages,
      totalRecords
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching income statement" });
  } finally {
    if (connection) await connection.close();
  }
};
