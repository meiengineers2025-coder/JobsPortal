// src/utils/invoice.js

import PDFDocument from "pdfkit";
import dayjs from "dayjs";

/**
 * Generates Invoice PDF (buffer)
 */
export function generateInvoicePDF({ name, email, amount }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });

      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // HEADER
      doc.fontSize(22).text("Dream Jobs Portal", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).text("Payment Invoice", { align: "center" });
      doc.moveDown(1.5);

      // CUSTOMER DETAILS
      doc.fontSize(14).text(`Billed To:`, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`${name}`);
      doc.text(`${email}`);
      doc.moveDown(1);

      // PAYMENT DETAILS
      doc.fontSize(14).text(`Payment Details`, { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12).text(`Amount Paid: ₹ ${(amount / 100).toFixed(2)}`);
      doc.text(`Date: ${dayjs().format("DD MMM YYYY @ hh:mm A")}`);
      doc.moveDown(1.5);

      // FOOTER
      doc
        .fontSize(12)
        .text(
          "Thank you for your purchase. This invoice was generated automatically.",
          { align: "center" }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}