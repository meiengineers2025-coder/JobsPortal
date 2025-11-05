// routes/whatsapp.js

import express from "express";
import db from "../src/config/db.js";
import fetch from "node-fetch";
import { ensureLoggedIn } from "../src/utils/access.js";

const router = express.Router();

/**
 * SAVE USER PHONE NUMBER FOR WHATSAPP ALERTS
 */
router.post("/whatsapp/subscribe", ensureLoggedIn, (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).send("Phone required");

  db.prepare(`
      INSERT INTO candidate_profiles (user_id, comments)
      VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET comments = excluded.comments
    `)
    .run(req.session.user.id, `WhatsApp:${phone}`);

  res.redirect("/candidate/dashboard");
});

/**
 * SEND MATCHED JOB ALERT TO WHATSAPP (called internally)
 */
export async function sendWhatsAppMessage(toNumber, message) {
  try {
    const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

    await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toNumber,
        type: "text",
        text: { body: message },
      }),
    });

    console.log("✅ WhatsApp alert sent to", toNumber);
  } catch (err) {
    console.error("❌ WhatsApp API error:", err.message);
  }
}

/**
 * WEBHOOK FOR META WHATSAPP VERIFICATION
 */
router.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.send(req.query["hub.challenge"]);
  }
  res.status(401).send("Verification failed");
});

export default router;