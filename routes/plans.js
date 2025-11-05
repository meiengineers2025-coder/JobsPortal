// routes/plans.js
// Pricing plan logic (₹99 premium access for 1 hour)

import express from "express";
import db from "../src/config/db.js";
import { ensureLoggedIn } from "../src/utils/access.js";

const router = express.Router();

/**
 * SHOW PRICING PAGE
 */
router.get("/pricing", ensureLoggedIn, (req, res) => {
  res.render("pricing", {
    user: req.session.user,
  });
});


/**
 * CHECK IF USER HAS ACTIVE PREMIUM ACCESS
 * Returns JSON → UI decides what to unlock
 */
router.get("/premium-status", ensureLoggedIn, (req, res) => {
  const { id } = req.session.user;

  // Check latest payment record
  const entry = db
    .prepare(
      `SELECT expires_at, status FROM payments
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .get(id);

  if (!entry || entry.status !== "paid") {
    return res.json({ premium: false });
  }

  const expired = new Date(entry.expires_at) < new Date();
  return res.json({ premium: !expired });
});


/**
 * PREMIUM GUARD — call this from any route needing premium gating
 */
export function requirePremium(req, res, next) {
  const latest = db
    .prepare(
      `SELECT expires_at, status FROM payments
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .get(req.session.user.id);

  if (!latest || latest.status !== "paid" || new Date(latest.expires_at) < new Date()) {
    return res.redirect("/pricing");
  }

  next();
}

export default router;