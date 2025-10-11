// controllers/ledger.controller.js
import { getConnection, oracledb } from "../config/db.js";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// 1️⃣ Get Ledger List
// =========================
export const getLedger = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const { accountId, fromDate, toDate } = req.query;

    let query = `
      SELECT LEDGER_ID, ENTRY_DATE, ENTRY_NO, ACCOUNT_NAME, PARTICULARS, DEBIT, CREDIT, BALANCE
      FROM V_LEDGER
      WHERE 1=1
    `;
    const params = {};

    if (accountId) {
      query += " AND ACCOUNT_NAME = :accountId";
      params.accountId = accountId;
    }
    if (fromDate && toDate) {
      query += `
        AND ENTRY_DATE BETWEEN TO_DATE(:fromDate,'YYYY-MM-DD')
        AND TO_DATE(:toDate,'YYYY-MM-DD')
      `;
      params.fromDate = fromDate;
      params.toDate = toDate;
    }

    query += " ORDER BY ENTRY_DATE, LEDGER_ID";

    const result = await conn.execute(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // ✅ object output
    });

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching ledger:", err);
    res.status(500).json({ message: "Error fetching ledger" });
  } finally {
    if (conn) await conn.close();
  }
};

// =========================
// 2️⃣ Generate Ledger Voucher PDF
// =========================
export const generateLedgerVoucher = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const { id } = req.params;

    const query = `
      SELECT ENTRY_DATE, ENTRY_NO, ACCOUNT_NAME, PARTICULARS, DEBIT, CREDIT, BALANCE
      FROM V_LEDGER
      WHERE LEDGER_ID = :id
    `;

    const result = await conn.execute(query, { id }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    if (!result.rows.length) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    const row = result.rows[0];

    // --- PDF Generation ---
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=voucher_${row.ENTRY_NO}.pdf`);
    doc.pipe(res);

    // Header
    doc.fillColor("#0d47a1").fontSize(18).font("Helvetica-Bold")
      .text("Excellence ICT Ltd.", { align: "center" });
    doc.moveDown(0.5);
    doc.fillColor("#000").fontSize(16).text(`Ledger Voucher #${row.ENTRY_NO}`, { align: "center" });
    doc.moveDown();

    // Info
    doc.fontSize(12).font("Helvetica");
    doc.text(`Date: ${formatDate(row.ENTRY_DATE)}`);
    doc.text(`Account: ${row.ACCOUNT_NAME}`);
    doc.moveDown();

    // Particulars
    doc.font("Helvetica-Bold").text("Particulars:", { underline: true });
    doc.font("Helvetica").text(row.PARTICULARS || "");
    doc.moveDown(1.5);

    // Amount Table
    const tableTop = doc.y;
    const col1 = 50, col2 = 250, col3 = 450;
    doc.font("Helvetica-Bold").fillColor("#000");
    doc.text("Debit", col1, tableTop, { width: 150, align: "center" });
    doc.text("Credit", col2, tableTop, { width: 150, align: "center" });
    doc.text("Balance", col3, tableTop, { width: 150, align: "center" });

    doc.moveDown(0.5);
    const rowTop = doc.y;
    doc.font("Helvetica").fillColor("#000");
    doc.text(Number(row.DEBIT || 0).toFixed(2), col1, rowTop, { width: 150, align: "center" });
    doc.text(Number(row.CREDIT || 0).toFixed(2), col2, rowTop, { width: 150, align: "center" });
    doc.text(Number(row.BALANCE || 0).toFixed(2), col3, rowTop, { width: 150, align: "center" });

    doc.moveDown(4);

    // Footer / Signatures
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;
    const halfWidth = (pageWidth - margin * 2) / 2;

    const preparedBy = req.user?.name || "__________________"; // ✅ logged-in user
    doc.text(`Prepared By: ${preparedBy}`, margin, doc.y, { width: halfWidth, align: "left" });
    doc.text("Authorized By: ____________________", margin + halfWidth, doc.y, { width: halfWidth, align: "right" });

    doc.end();

  } catch (err) {
    console.error("Error generating voucher PDF:", err);
    res.status(500).json({ message: "Error generating voucher PDF" });
  } finally {
    if (conn) await conn.close();
  }
};
// =========================
// Helper: Format Date
// =========================
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
};
