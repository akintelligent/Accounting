import ExcelJS from "exceljs";
import { getConnection } from "../../config/db.js";

export const generateTrialBalanceExcel = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(`
      SELECT ACCOUNT_NAME, TOTAL_DEBIT, TOTAL_CREDIT, BALANCE
      FROM VW_TRIAL_BALANCE
      ORDER BY ACCOUNT_NAME
    `);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Trial Balance");

    // Header styling
    sheet.columns = [
      { header: "Account Name", key: "account_name", width: 40 },
      { header: "Debit", key: "debit", width: 15 },
      { header: "Credit", key: "credit", width: 15 },
      { header: "Balance", key: "balance", width: 15 },
    ];

    sheet.getRow(1).font = { bold: true };

    let totalDebit = 0;
    let totalCredit = 0;

    // Adding rows
    result.rows.forEach((row) => {
      const [ACCOUNT_NAME, TOTAL_DEBIT, TOTAL_CREDIT, BALANCE] = row;

      totalDebit += Number(TOTAL_DEBIT || 0);
      totalCredit += Number(TOTAL_CREDIT || 0);

      sheet.addRow({
        account_name: ACCOUNT_NAME,
        debit: TOTAL_DEBIT?.toFixed(2) || "0.00",
        credit: TOTAL_CREDIT?.toFixed(2) || "0.00",
        balance: BALANCE?.toFixed(2) || "0.00",
      });
    });

    // Total row
    sheet.addRow({});
    sheet.addRow({
      account_name: "Total",
      debit: totalDebit.toFixed(2),
      credit: totalCredit.toFixed(2),
      balance: (totalDebit - totalCredit).toFixed(2),
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Trial_Balance.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (err) {
    console.error("Error generating Excel:", err);
    res.status(500).json({ message: "Error generating Excel" });
  } finally {
    if (connection) await connection.close();
  }
};
