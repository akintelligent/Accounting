import { getConnection } from "../config/db.js";

export const getBalanceSheet = async (req, res) => {
  let connection;
  try {
    const { fromDate, toDate, page = 1, pageSize = 10, sortField = "ACCOUNT_NAME", sortOrder = "ASC" } = req.query;
    connection = await getConnection();

    const offset = (page - 1) * pageSize;

    const query = `
      SELECT ACCOUNT_ID, ACCOUNT_NAME, ACCOUNT_TYPE, TOTAL_DEBIT, TOTAL_CREDIT, BALANCE
      FROM VW_BALANCE_SHEET
      WHERE ENTRY_DATE BETWEEN NVL(TO_DATE(:fromDate,'YYYY-MM-DD'), TRUNC(SYSDATE))
                           AND NVL(TO_DATE(:toDate,'YYYY-MM-DD'), SYSDATE)
      ORDER BY ${sortField} ${sortOrder}
      OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY
    `;

    const result = await connection.execute(query, { fromDate, toDate, offset: Number(offset), pageSize: Number(pageSize) });

    const countResult = await connection.execute(`
      SELECT COUNT(*) FROM VW_BALANCE_SHEET
      WHERE ENTRY_DATE BETWEEN NVL(TO_DATE(:fromDate,'YYYY-MM-DD'), TRUNC(SYSDATE))
                           AND NVL(TO_DATE(:toDate,'YYYY-MM-DD'), SYSDATE)
    `, { fromDate, toDate });

    res.status(200).json({
      data: result.rows || [],
      total: countResult.rows[0][0] || 0
    });
  } catch (err) {
    console.error("❌ Error fetching balance sheet:", err);
    res.status(500).json({ message: "Error fetching balance sheet" });
  } finally {
    if (connection) await connection.close();
  }
};
