
import path from "path";
import PdfPrinter from "pdfmake";
import { fileURLToPath } from "url";
import { getConnection } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ PDF Fonts setup
const fonts = {
  Roboto: {
    normal: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-Regular.ttf"),
    bold: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-Medium.ttf"),
    italics: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-Italic.ttf"),
    bolditalics: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-MediumItalic.ttf"),
  },
};
const printer = new PdfPrinter(fonts);

// =========================
// 📘 1️⃣ Get Ledger List (with filter)
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
      query += " AND ENTRY_DATE BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD')";
      params.fromDate = fromDate;
      params.toDate = toDate;
    }

    query += " ORDER BY ENTRY_DATE, LEDGER_ID";

    const result = await conn.execute(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching ledger:", err);
    res.status(500).json({ message: "Error fetching ledger data" });
  } finally {
    if (conn) await conn.close();
  }
};

// =========================
// 📗 2️⃣ Generate Ledger PDF Report (with opening balance)
// =========================
export const generateLedgerReport = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    const { accountId, fromDate, toDate } = req.query;

    // Opening balance
    let openingBalanceQuery = `
      SELECT NVL(SUM(DEBIT - CREDIT), 0)
      FROM V_LEDGER
      WHERE ENTRY_DATE < TO_DATE(:fromDate, 'YYYY-MM-DD')
    `;
    const params = { fromDate };

    if (accountId) {
      openingBalanceQuery += " AND ACCOUNT_NAME = :accountId";
      params.accountId = accountId;
    }

    const openingResult = await conn.execute(openingBalanceQuery, params);
    const openingBalance = Number(openingResult.rows[0][0]) || 0;

    // Ledger data
    let query = `
      SELECT ENTRY_DATE, ENTRY_NO, ACCOUNT_NAME, PARTICULARS, DEBIT, CREDIT, BALANCE
      FROM V_LEDGER
      WHERE ENTRY_DATE BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD')
    `;
    if (accountId) query += " AND ACCOUNT_NAME = :accountId";
    query += " ORDER BY ENTRY_DATE, LEDGER_ID";

    const result = await conn.execute(query, params);
    const data = result.rows;

    if (data.length === 0) {
      return res.status(404).json({ message: "No ledger data found" });
    }

    // PDF table body
    const body = [
      [
        { text: "Date", bold: true },
        { text: "Entry No", bold: true },
        { text: "Particulars", bold: true },
        { text: "Debit", bold: true, alignment: "right" },
        { text: "Credit", bold: true, alignment: "right" },
        { text: "Balance", bold: true, alignment: "right" },
      ],
      [
        { text: "", colSpan: 2 },
        {},
        { text: "Opening Balance", bold: true },
        {},
        {},
        { text: openingBalance.toFixed(2), alignment: "right" },
      ],
      ...data.map((r) => [
        r[0],
        r[1],
        r[3],
        { text: r[4] || "", alignment: "right" },
        { text: r[5] || "", alignment: "right" },
        { text: r[6] || "", alignment: "right" },
      ]),
    ];

    const docDefinition = {
      content: [
        { text: "Ledger Report", style: "header" },
        accountId ? { text: `Account: ${accountId}`, margin: [0, 0, 0, 10] } : "",
        {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "*", "auto", "auto", "auto"],
            body,
          },
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: "center", margin: [0, 0, 0, 10] },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=ledger.pdf");
      res.send(pdfBuffer);
    });
    pdfDoc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ message: "Error generating PDF" });
  } finally {
    if (conn) await conn.close();
  }
};



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
    const result = await conn.execute(query, { id });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    const row = result.rows[0];

    const docDefinition = {
      content: [
        { text: "Voucher", style: "header" },
        { text: `Entry No: ${row[1]}`, style: "subheader" },
        { text: `Date: ${row[0]}`, style: "subheader" },
        { text: `Account: ${row[2]}`, style: "subheader" },
        { text: "\nParticulars", bold: true },
        { text: row[3] },
        {
          style: "tableExample",
          table: {
            widths: ["*", "auto", "auto"],
            body: [
              [
                { text: "Debit", bold: true },
                { text: "Credit", bold: true },
                { text: "Balance", bold: true },
              ],
              [
                { text: row[4] || "", alignment: "right" },
                { text: row[5] || "", alignment: "right" },
                { text: row[6] || "", alignment: "right" },
              ],
            ],
          },
        },
      ],
      styles: {
        header: { fontSize: 20, bold: true, alignment: "center", margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, margin: [0, 2, 0, 2] },
        tableExample: { margin: [0, 5, 0, 15] },
      },
    };

    const fonts = {
      Roboto: {
        normal: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-Regular.ttf"),
        bold: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-Medium.ttf"),
        italics: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-Italic.ttf"),
        bolditalics: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-MediumItalic.ttf"),
      },
    };

    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename=voucher_${id}.pdf`);
      res.send(pdfBuffer);
    });
    pdfDoc.end();
  } catch (err) {
    console.error("Error generating voucher PDF:", err);
    res.status(500).json({ message: "Error generating voucher PDF" });
  } finally {
    if (conn) await conn.close();
  }
};

