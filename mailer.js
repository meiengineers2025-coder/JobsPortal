// src/utils/mailer.js

import nodemailer from "nodemailer";

export async function sendInvoiceEmail(toEmail, pdfBuffer, amount) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: toEmail,
      subject: `Payment Receipt - ₹${amount / 100}`,
      text: "Thank you for your payment. Invoice attached.",
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log("✅ Invoice email sent to:", toEmail);
  } catch (err) {
    console.error("❌ Mail error:", err);
  }
}