import { getConnection } from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const conn = await getConnection();

    // 1. Ledger Totals
    const ledgerResult = await conn.execute(`
      SELECT SUM(debit) AS TOTAL_DEBIT, SUM(credit) AS TOTAL_CREDIT
      FROM V_LEDGER
    `);

    // 2. Balance Sheet Totals
    const balanceSheetResult = await conn.execute(`
      SELECT SUM(assets) AS TOTAL_ASSETS, SUM(liabilities) AS TOTAL_LIABILITIES
      FROM VW_BALANCE_SHEET
    `);

    // 3. Cash Flow Totals
    const cashFlowResult = await conn.execute(`
      SELECT SUM(receipts) AS TOTAL_RECEIPTS, SUM(payments) AS TOTAL_PAYMENTS
      FROM VW_CASH_FLOW
    `);

    // 4. Income Statement Totals
    const incomeStatementResult = await conn.execute(`
      SELECT SUM(income) AS TOTAL_INCOME, SUM(expense) AS TOTAL_EXPENSE
      FROM VW_INCOME_STATEMENT
    `);

    // 5. Trial Balance Summary
    const trialBalanceResult = await conn.execute(`
      SELECT SUM(debit) AS TOTAL_TRIAL_DEBIT, SUM(credit) AS TOTAL_TRIAL_CREDIT
      FROM VW_TRIAL_BALANCE
    `);

    await conn.close();

    return res.json({
      success: true,
      data: {
        totalDebit: ledgerResult.rows[0][0],
        totalCredit: ledgerResult.rows[0][1],
        totalAssets: balanceSheetResult.rows[0][0],
        totalLiabilities: balanceSheetResult.rows[0][1],
        totalReceipts: cashFlowResult.rows[0][0],
        totalPayments: cashFlowResult.rows[0][1],
        totalIncome: incomeStatementResult.rows[0][0],
        totalExpense: incomeStatementResult.rows[0][1],
        totalTrialDebit: trialBalanceResult.rows[0][0],
        totalTrialCredit: trialBalanceResult.rows[0][1]
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ success: false, message: "Error fetching dashboard data" });
  }
};
