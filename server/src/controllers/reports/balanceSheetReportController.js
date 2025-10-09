import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { getConnection } from "../../config/db.js";

export const generateBalanceSheetPDF = async (req, res) => {
  const { fromDate, toDate } = req.query;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT ACCOUNT_NAME, ACCOUNT_TYPE, NVL(TOTAL_DEBIT,0), NVL(TOTAL_CREDIT,0), NVL(BALANCE,0)
       FROM VW_BALANCE_SHEET
       ORDER BY ACCOUNT_NAME`
    );

    const rows = result.rows || [];

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Balance_Sheet.pdf");

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    doc.pipe(res);

    // Title
    doc.fontSize(18).text("Balance Sheet Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Generated On: ${new Date().toLocaleString()}`, { align: "right" });
    doc.moveDown();

    // Table Header
    doc.font("Helvetica-Bold");
    doc.text("Account Name", 50);
    doc.text("Account Type", 200);
    doc.text("Debit", 300, { width: 80, align: "right" });
    doc.text("Credit", 400, { width: 80, align: "right" });
    doc.text("Balance", 500, { width: 80, align: "right" });
    doc.moveDown(0.5);
    doc.font("Helvetica");

    rows.forEach((row) => {
      const accountName = row[0] || "";
      const accountType = row[1] || "";

      const debit = isNaN(Number(row[2])) ? "0.00" : Number(row[2]).toFixed(2);
      const credit = isNaN(Number(row[3])) ? "0.00" : Number(row[3]).toFixed(2);
      const balance = isNaN(Number(row[4])) ? "0.00" : Number(row[4]).toFixed(2);

      doc.text(accountName, 50);
      doc.text(accountType, 200);
      doc.text(debit, 300, { width: 80, align: "right" });
      doc.text(credit, 400, { width: 80, align: "right" });
      doc.text(balance, 500, { width: 80, align: "right" });
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    console.error("❌ Error generating PDF:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error generating PDF" });
    }
  } finally {
    if (connection) await connection.close();
  }
};

export const generateBalanceSheetExcel = async (req, res) => {
  let connection;
  try {
    const { fromDate, toDate } = req.query;
    connection = await getConnection();

    const result = await connection.execute(`
      SELECT ACCOUNT_NAME, ACCOUNT_TYPE, TOTAL_DEBIT, TOTAL_CREDIT, BALANCE
      FROM VW_BALANCE_SHEET
      WHERE ENTRY_DATE BETWEEN NVL(TO_DATE(:fromDate,'YYYY-MM-DD'), TRUNC(SYSDATE))
                           AND NVL(TO_DATE(:toDate,'YYYY-MM-DD'), SYSDATE)
      ORDER BY ACCOUNT_TYPE, ACCOUNT_NAME
    `, { fromDate, toDate });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Balance Sheet");

    worksheet.columns = [
      { header: "Account Name", key: "accountName", width: 30 },
      { header: "Account Type", key: "accountType", width: 15 },
      { header: "Debit", key: "debit", width: 15 },
      { header: "Credit", key: "credit", width: 15 },
      { header: "Balance", key: "balance", width: 15 }
    ];

    result.rows.forEach(row => {
      worksheet.addRow({
        accountName: row[0],
        accountType: row[1],
        debit: Number(row[2]).toFixed(2),
        credit: Number(row[3]).toFixed(2),
        balance: Number(row[4]).toFixed(2)
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=BalanceSheet.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating Excel" });
  } finally {
    if (connection) await connection.close();
  }
};
