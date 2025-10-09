import PDFDocument from "pdfkit";
import { getConnection } from "../../config/db.js";
import fs from "fs";
import path from "path";

export const generateTrialBalancePDF = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(`
      SELECT ACCOUNT_NAME, TOTAL_DEBIT, TOTAL_CREDIT, BALANCE
      FROM VW_TRIAL_BALANCE
      ORDER BY ACCOUNT_NAME
    `);

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Trial_Balance.pdf"
    );

    // 📌 Logo
    const logoPath = path.join(process.cwd(), "public", "logo.png"); // logo file path
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 20, { width: 80 });
    }

    // 📝 Header
    doc.fontSize(20).text("Trial Balance Report", 150, 30, {
      align: "center",
    });
    doc.moveDown(0.5);
    doc.fontSize(10).text(
      "Generated On: " + new Date().toLocaleString(),
      { align: "right" }
    );

    doc.moveDown(2);

    // 📊 Table Header
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Account Name", 50, doc.y);
    doc.text("Debit", 300, doc.y, { width: 80, align: "right" });
    doc.text("Credit", 400, doc.y, { width: 80, align: "right" });
    doc.text("Balance", 500, doc.y, { width: 80, align: "right" });
    doc.moveDown(0.5);
    doc.font("Helvetica");

    // 📊 Table Rows
    let totalDebit = 0;
    let totalCredit = 0;
    result.rows.forEach((row) => {
      const [ACCOUNT_NAME, TOTAL_DEBIT, TOTAL_CREDIT, BALANCE] = row;

      totalDebit += Number(TOTAL_DEBIT || 0);
      totalCredit += Number(TOTAL_CREDIT || 0);

      doc.text(ACCOUNT_NAME, 50, doc.y);
      doc.text(TOTAL_DEBIT?.toFixed(2) || "0.00", 300, doc.y, {
        width: 80,
        align: "right",
      });
      doc.text(TOTAL_CREDIT?.toFixed(2) || "0.00", 400, doc.y, {
        width: 80,
        align: "right",
      });
      doc.text(BALANCE?.toFixed(2) || "0.00", 500, doc.y, {
        width: 80,
        align: "right",
      });
      doc.moveDown(0.5);
    });

    // 🧮 Total Row
    doc.moveDown(1);
    doc.font("Helvetica-Bold");
    doc.text("Total", 50, doc.y);
    doc.text(totalDebit.toFixed(2), 300, doc.y, {
      width: 80,
      align: "right",
    });
    doc.text(totalCredit.toFixed(2), 400, doc.y, {
      width: 80,
      align: "right",
    });
    doc.text((totalDebit - totalCredit).toFixed(2), 500, doc.y, {
      width: 80,
      align: "right",
    });

    // 📌 Footer
    doc.moveDown(3);
    doc.fontSize(8).text(
      "This is a system generated Trial Balance report.",
      { align: "center" }
    );

    // Page number
    const range = doc.bufferedPageRange(); // => { start: 0, count: 1 }
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.text(
        `Page ${i + 1} of ${range.count}`,
        50,
        doc.page.height - 50,
        { align: "center" }
      );
    }

    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ message: "Error generating PDF" });
  } finally {
    if (connection) await connection.close();
  }
};
