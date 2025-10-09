import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { getConnection } from "../../config/db.js";

export const generateIncomeStatementPDF = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const { fromDate, toDate } = req.query;

    const result = await connection.execute(
      `SELECT ACCOUNT_NAME, ACCOUNT_TYPE, TOTAL_DEBIT, TOTAL_CREDIT, NET_AMOUNT
       FROM VW_INCOME_STATEMENT
       WHERE (:fromDate IS NULL OR ENTRY_DATE >= TO_DATE(:fromDate, 'YYYY-MM-DD'))
       AND (:toDate IS NULL OR ENTRY_DATE <= TO_DATE(:toDate, 'YYYY-MM-DD'))
       ORDER BY ACCOUNT_TYPE, ACCOUNT_NAME`,
      { fromDate, toDate }
    );

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=IncomeStatement.pdf");

    doc.fontSize(18).text("Income Statement", { align: "center" });
    doc.moveDown();
    doc.fontSize(10);
    doc.text("Generated On: " + new Date().toLocaleString(), { align: "right" });
    doc.moveDown();

    doc.font("Helvetica-Bold");
    doc.text("Account Name", 50, doc.y);
    doc.text("Type", 200, doc.y);
    doc.text("Debit", 300, doc.y, { width: 60, align: "right" });
    doc.text("Credit", 380, doc.y, { width: 60, align: "right" });
    doc.text("Net Amount", 460, doc.y, { width: 80, align: "right" });
    doc.moveDown(0.5);
    doc.font("Helvetica");

    result.rows.forEach(row => {
      const [ACCOUNT_NAME, ACCOUNT_TYPE, TOTAL_DEBIT, TOTAL_CREDIT, NET_AMOUNT] = row;
      doc.text(ACCOUNT_NAME, 50, doc.y);
      doc.text(ACCOUNT_TYPE, 200, doc.y);
      doc.text(TOTAL_DEBIT?.toFixed(2), 300, doc.y, { width: 60, align: "right" });
      doc.text(TOTAL_CREDIT?.toFixed(2), 380, doc.y, { width: 60, align: "right" });
      doc.text(NET_AMOUNT?.toFixed(2), 460, doc.y, { width: 80, align: "right" });
      doc.moveDown(0.5);
    });

    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating PDF" });
  } finally {
    if (connection) await connection.close();
  }
};

export const generateIncomeStatementExcel = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const { fromDate, toDate } = req.query;

    const result = await connection.execute(
      `SELECT ACCOUNT_NAME, ACCOUNT_TYPE, TOTAL_DEBIT, TOTAL_CREDIT, NET_AMOUNT
       FROM VW_INCOME_STATEMENT
       WHERE (:fromDate IS NULL OR ENTRY_DATE >= TO_DATE(:fromDate, 'YYYY-MM-DD'))
       AND (:toDate IS NULL OR ENTRY_DATE <= TO_DATE(:toDate, 'YYYY-MM-DD'))
       ORDER BY ACCOUNT_TYPE, ACCOUNT_NAME`,
      { fromDate, toDate }
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Income Statement");

    worksheet.columns = [
      { header: "Account Name", key: "accountName", width: 30 },
      { header: "Account Type", key: "accountType", width: 15 },
      { header: "Debit", key: "debit", width: 15 },
      { header: "Credit", key: "credit", width: 15 },
      { header: "Net Amount", key: "netAmount", width: 15 }
    ];

    result.rows.forEach(row => {
      worksheet.addRow({
        accountName: row[0],
        accountType: row[1],
        debit: row[2]?.toFixed(2),
        credit: row[3]?.toFixed(2),
        netAmount: row[4]?.toFixed(2)
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=IncomeStatement.xlsx"
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
