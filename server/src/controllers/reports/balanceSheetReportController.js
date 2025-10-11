import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { getConnection } from "../../config/db.js";

const safeNumber = (val) => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

export const generateBalanceSheetPDF = async (req, res) => {
  const { fromDate, toDate } = req.query;
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT ACCOUNT_NAME, ACCOUNT_TYPE, TOTAL_DEBIT, TOTAL_CREDIT, BALANCE
       FROM VW_BALANCE_SHEET
       WHERE ENTRY_DATE BETWEEN NVL(TO_DATE(:fromDate,'YYYY-MM-DD'), TRUNC(SYSDATE))
                            AND NVL(TO_DATE(:toDate,'YYYY-MM-DD'), SYSDATE)
       ORDER BY ACCOUNT_TYPE, ACCOUNT_NAME`,
      { fromDate, toDate },
      { outFormat: 1 } // object format
    );

    const rows = result.rows || [];

    // PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Balance_Sheet.pdf");

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    doc.pipe(res);

    doc.fontSize(18).text("Balance Sheet Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Generated On: ${new Date().toLocaleString()}`, { align: "right" });
    doc.moveDown();

    doc.font("Helvetica-Bold");
    doc.text("Account Name", 50);
    doc.text("Account Type", 200);
    doc.text("Debit", 300, { width: 80, align: "right" });
    doc.text("Credit", 400, { width: 80, align: "right" });
    doc.text("Balance", 500, { width: 80, align: "right" });
    doc.moveDown(0.5);
    doc.font("Helvetica");

    rows.forEach(row => {
      doc.text(row.ACCOUNT_NAME || "", 50);
      doc.text(row.ACCOUNT_TYPE || "", 200);
      doc.text(safeNumber(row.TOTAL_DEBIT).toFixed(2), 300, { width: 80, align: "right" });
      doc.text(safeNumber(row.TOTAL_CREDIT).toFixed(2), 400, { width: 80, align: "right" });
      doc.text(safeNumber(row.BALANCE).toFixed(2), 500, { width: 80, align: "right" });
      doc.moveDown(0.5);
    });

    doc.end();

  } catch (err) {
    console.error("❌ PDF generation error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Error generating PDF" });
  } finally {
    if (connection) await connection.close();
  }
};

export const generateBalanceSheetExcel = async (req, res) => {
  const { fromDate, toDate } = req.query;
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT ACCOUNT_NAME, ACCOUNT_TYPE, TOTAL_DEBIT, TOTAL_CREDIT, BALANCE
       FROM VW_BALANCE_SHEET
       WHERE ENTRY_DATE BETWEEN NVL(TO_DATE(:fromDate,'YYYY-MM-DD'), TRUNC(SYSDATE))
                            AND NVL(TO_DATE(:toDate,'YYYY-MM-DD'), SYSDATE)
       ORDER BY ACCOUNT_TYPE, ACCOUNT_NAME`,
      { fromDate, toDate },
      { outFormat: 1 }
    );

    const rows = result.rows || [];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Balance Sheet");

    sheet.columns = [
      { header: "Account Name", key: "ACCOUNT_NAME", width: 30 },
      { header: "Account Type", key: "ACCOUNT_TYPE", width: 20 },
      { header: "Debit", key: "TOTAL_DEBIT", width: 15 },
      { header: "Credit", key: "TOTAL_CREDIT", width: 15 },
      { header: "Balance", key: "BALANCE", width: 15 }
    ];

    rows.forEach(row => {
      sheet.addRow({
        ACCOUNT_NAME: row.ACCOUNT_NAME || "",
        ACCOUNT_TYPE: row.ACCOUNT_TYPE || "",
        TOTAL_DEBIT: safeNumber(row.TOTAL_DEBIT),
        TOTAL_CREDIT: safeNumber(row.TOTAL_CREDIT),
        BALANCE: safeNumber(row.BALANCE)
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=Balance_Sheet.xlsx");

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("❌ Excel generation error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Error generating Excel" });
  } finally {
    if (connection) await connection.close();
  }
};
