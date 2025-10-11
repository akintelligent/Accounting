import path from "path";
import PdfPrinter from "pdfmake";

// ✅ PDF Fonts
const fonts = {
  Roboto: {
    normal: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-Regular.ttf"),
    bold: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-Medium.ttf"),
    italics: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-Italic.ttf"),
    bolditalics: path.resolve("node_modules/pdfmake/examples/fonts/Roboto-MediumItalic.ttf"),
  },
};

/**
 * Generates PDF from docDefinition and streams it via Express res
 * @param {object} docDefinition pdfmake docDefinition
 * @param {object} res Express response
 * @param {string} filename name of PDF file
 */
export const streamPdf = (docDefinition, res, filename = "document.pdf") => {
  const printer = new PdfPrinter(fonts);
  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  const chunks = [];
  pdfDoc.on("data", (chunk) => chunks.push(chunk));
  pdfDoc.on("end", () => {
    const pdfBuffer = Buffer.concat(chunks);
    console.log(`${filename} length:`, pdfBuffer.length);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=${filename}`);
    res.send(pdfBuffer);
  });
  pdfDoc.end();
};
