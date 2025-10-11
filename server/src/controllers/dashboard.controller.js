import { getConnection, oracledb } from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  let conn;

  try {
    conn = await getConnection();

    // Always return results as objects with column names
    const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

    // Ledger Totals
    const ledgerResult = await conn.execute(`
      SELECT NVL(SUM(DEBIT),0) AS TOTAL_DEBIT, NVL(SUM(CREDIT),0) AS TOTAL_CREDIT
      FROM V_LEDGER
    `, [], options);

    // Balance Sheet Totals
    const balanceSheetResult = await conn.execute(`
      SELECT
        NVL(SUM(CASE WHEN ACCOUNT_TYPE='Asset' THEN BALANCE ELSE 0 END),0) AS TOTAL_ASSETS,
        NVL(SUM(CASE WHEN ACCOUNT_TYPE IN ('Liability','Equity') THEN BALANCE ELSE 0 END),0) AS TOTAL_LIABILITIES
      FROM VW_BALANCE_SHEET
    `, [], options);

    // Cash Flow Totals
    const cashFlowResult = await conn.execute(`
      SELECT
        NVL(SUM(CASE WHEN CASHFLOW_CATEGORY='Receipt' THEN NET_CASH_FLOW ELSE 0 END),0) AS TOTAL_RECEIPTS,
        NVL(SUM(CASE WHEN CASHFLOW_CATEGORY='Payment' THEN NET_CASH_FLOW ELSE 0 END),0) AS TOTAL_PAYMENTS
      FROM VW_CASH_FLOW
    `, [], options);

    // Income Statement Totals
    const incomeStatementResult = await conn.execute(`
      SELECT
        NVL(SUM(CASE WHEN ACCOUNT_TYPE='Revenue' THEN NET_AMOUNT ELSE 0 END),0) AS TOTAL_INCOME,
        NVL(SUM(CASE WHEN ACCOUNT_TYPE='Expense' THEN NET_AMOUNT ELSE 0 END),0) AS TOTAL_EXPENSE
      FROM VW_INCOME_STATEMENT
    `, [], options);

    // Trial Balance Totals
    const trialBalanceResult = await conn.execute(`
      SELECT NVL(SUM(TOTAL_DEBIT),0) AS TOTAL_TRIAL_DEBIT,
             NVL(SUM(TOTAL_CREDIT),0) AS TOTAL_TRIAL_CREDIT
      FROM VW_TRIAL_BALANCE
    `, [], options);

    const ledger = ledgerResult.rows[0] || {};
    const balanceSheet = balanceSheetResult.rows[0] || {};
    const cashFlow = cashFlowResult.rows[0] || {};
    const incomeStatement = incomeStatementResult.rows[0] || {};
    const trialBalance = trialBalanceResult.rows[0] || {};

    return res.json({
      success: true,
      data: {
        totalDebit: ledger.TOTAL_DEBIT,
        totalCredit: ledger.TOTAL_CREDIT,
        totalAssets: balanceSheet.TOTAL_ASSETS,
        totalLiabilities: balanceSheet.TOTAL_LIABILITIES,
        totalReceipts: cashFlow.TOTAL_RECEIPTS,
        totalPayments: cashFlow.TOTAL_PAYMENTS,
        totalIncome: incomeStatement.TOTAL_INCOME,
        totalExpense: incomeStatement.TOTAL_EXPENSE,
        totalTrialDebit: trialBalance.TOTAL_TRIAL_DEBIT,
        totalTrialCredit: trialBalance.TOTAL_TRIAL_CREDIT,
      },
    });

  } catch (error) {
    console.error("❌ Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error("⚠️ Error closing Oracle connection:", closeErr);
      }
    }
  }
};
