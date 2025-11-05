// routes/referrals.js

import express from "express";
import db from "../src/config/db.js";
import { ensureLoggedIn } from "../src/utils/access.js";

const router = express.Router();

/**
 * SHOW REFERRAL LEADERBOARD (public or logged-in)
 */
router.get("/referrals", ensureLoggedIn, (req, res) => {
  const leaderboard = db
    .prepare(
      `SELECT users.name, COUNT(referrals.id) AS total
       FROM referrals
       JOIN users ON referrals.referrer_id = users.id
       GROUP BY referrer_id
       ORDER BY total DESC
       LIMIT 10`
    )
    .all();

  res.render("leaderboard", {
    user: req.session.user,
    leaderboard,
  });
});

/**
 * ADD A REFERRAL (candidate or employer refers someone)
 */
router.post("/referrals/add", ensureLoggedIn, (req, res) => {
  const { email } = req.body;

  if (!email) return res.redirect("/referrals");

  db.prepare(
    `INSERT INTO referrals (referrer_id, referred_email)
     VALUES (?, ?)`
  ).run(req.session.user.id, email);

  res.redirect("/referrals");
});

export default router;