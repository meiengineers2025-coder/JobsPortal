// routes/leaderboard.js

import express from "express";
import db from "../src/config/db.js";
import { ensureLoggedIn } from "../src/utils/access.js";

const router = express.Router();

/**
 * SHOW REFERRAL LEADERBOARD PAGE
 */
router.get("/leaderboard", ensureLoggedIn, (req, res) => {
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

export default router;