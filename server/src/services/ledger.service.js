import getConnection from "../config/db.js";

// ✅ Get Ledger List
export const getLedgerList = async () => {
  const result = await getConnection.execute(`
    SELECT LEDGER_ID, ENTRY_DATE, ENTRY_NO, ACCOUNT_NAME, PARTICULARS, DEBIT, CREDIT, BALANCE
    FROM V_LEDGER
    ORDER BY ENTRY_DATE
  `);
  return result.rows;
};
