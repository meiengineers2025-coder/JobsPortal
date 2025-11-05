// routes/payments.js

import express from "express";
import Razorpay from "razorpay";
import paypal from "@paypal/checkout-server-sdk";
import db from "../src/config/db.js";
import { ensureLoggedIn } from "../src/utils/access.js";
import { generateInvoicePDF } from "../src/utils/invoice.js";
import { sendInvoiceEmail } from "../src/utils/mailer.js";

const router = express.Router();

/* --------------------------------------------------------
   ✅ RAZORPAY INSTANCE (India Payments)
--------------------------------------------------------- */
const razorpay = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

/* --------------------------------------------------------
   ✅ PAYPAL INSTANCE (International / USD payments)
--------------------------------------------------------- */
const paypalEnv =
  process.env.PAYPAL_MODE === "live"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const paypalClient =
  process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
    ? new paypal.core.PayPalHttpClient(
        new paypalEnv(
          process.env.PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET
        )
      )
    : null;

/* --------------------------------------------------------
   ✅ CHECKOUT PAGE
--------------------------------------------------------- */
router.get("/checkout", ensureLoggedIn, (req, res) => {
  res.render("checkout", { user: req.session.user });
});

/* --------------------------------------------------------
   ✅ CREATE RAZORPAY ORDER (₹99 payment)
--------------------------------------------------------- */
router.post("/pay/razorpay", ensureLoggedIn, async (req, res) => {
  try {
    if (!razorpay) return res.status(500).send("Razorpay not configured");

    const amount = 99 * 100; // INR in paise

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    // Save payment record
    db.prepare(
      `INSERT INTO payments (user_id, role, provider, order_id, amount_paise)
       VALUES (?, ?, 'razorpay', ?, ?)`
    ).run(req.session.user.id, req.session.user.role, order.id, amount);

    res.json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Razorpay error:", err);
    res.status(500).send("Razorpay failed");
  }
});

/* --------------------------------------------------------
   ✅ CONFIRM RAZORPAY PAYMENT + EMAIL INVOICE
--------------------------------------------------------- */
router.post("/pay/razorpay/verify", ensureLoggedIn, async (req, res) => {
  const { payment_id, order_id } = req.body;

  const payment = db
    .prepare(`SELECT * FROM payments WHERE order_id = ?`)
    .get(order_id);

  if (!payment) return res.status(400).send("Order not found");

  // Update payment record
  db.prepare(
    `UPDATE payments SET payment_id = ?, status = 'paid', expires_at = DATETIME('now', '+1 hour')
     WHERE order_id = ?`
  ).run(payment_id, order_id);

  // Generate invoice PDF
  const pdfBuffer = await generateInvoicePDF({
    name: req.session.user.name,
    email: req.session.user.email,
    amount: payment.amount_paise,
  });

  // Send invoice email
  await sendInvoiceEmail(req.session.user.email, pdfBuffer, payment.amount_paise);

  return res.json({ success: true });
});

/* --------------------------------------------------------
   ✅ PAYPAL PAYMENT (International)
--------------------------------------------------------- */
router.post("/pay/paypal", ensureLoggedIn, async (req, res) => {
  try {
    if (!paypalClient) return res.status(500).send("PayPal not configured");

    const amount = "2.00"; // example USD equivalent

    let request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: amount },
        },
      ],
    });

    const order = await paypalClient.execute(request);

    // Save temporarily
    db.prepare(
      `INSERT INTO payments (user_id, role, provider, order_id, amount_paise)
       VALUES (?, ?, 'paypal', ?, ?)`
    ).run(req.session.user.id, req.session.user.role, order.result.id, 200); // USD ~ ₹200 symbolic

    res.json({ id: order.result.id });
  } catch (err) {
    console.error("PayPal error:", err);
    res.status(500).send("PayPal failed");
  }
});

/* --------------------------------------------------------
   ✅ CONFIRM PAYPAL + EMAIL INVOICE
--------------------------------------------------------- */
router.get("/pay/paypal/success/:orderId", ensureLoggedIn, async (req, res) => {
  try {
    const orderId = req.params.orderId;

    let captureReq = new paypal.orders.OrdersCaptureRequest(orderId);
    captureReq.requestBody({});

    await paypalClient.execute(captureReq);

    const payment = db
      .prepare(`SELECT * FROM payments WHERE order_id = ?`)
      .get(orderId);

    db.prepare(
      `UPDATE payments SET status = 'paid', expires_at = DATETIME('now', '+1 hour')
       WHERE order_id = ?`
    ).run(orderId);

    const pdfBuffer = await generateInvoicePDF({
      name: req.session.user.name,
      email: req.session.user.email,
      amount: payment.amount_paise,
    });

    await sendInvoiceEmail(req.session.user.email, pdfBuffer, payment.amount_paise);

    res.redirect("/candidate/dashboard");
  } catch (err) {
    console.error("PayPal capture error:", err);
    res.send("Payment failed");
  }
});

export default router;