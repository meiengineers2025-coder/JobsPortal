// routes/radar.js
// Real-time hiring radar — shows candidate when employer views their profile

import express from "express";
import db from "../src/config/db.js";
import { ensureLoggedIn } from "../src/utils/access.js";

const router = express.Router();

/**
 * EMPLOYER triggers a "viewed profile" event (called from UI)
 */
router.post("/radar/viewed", ensureLoggedIn, (req, res) => {
  const { candidate_id, job_id } = req.body;

  if (!candidate_id || !job_id) return res.status(400).send("Missing data");

  db.prepare(`
      INSERT INTO applications (candidate_id, job_id, status)
      VALUES (?, ?, 'Viewed')
    `).run(candidate_id, job_id);

  res.json({ success: true });
});

/**
 * CANDIDATE sees real-time radar feed
 */
router.get("/radar/feed", ensureLoggedIn, (req, res) => {
  const activity = db
    .prepare(
      `SELECT jobs.title, users.name AS employer, applications.status, applications.created_at
       FROM applications
       JOIN jobs ON applications.job_id = jobs.id
       JOIN users ON jobs.employer_id = users.id
       WHERE applications.candidate_id = ?
       ORDER BY applications.created_at DESC
       LIMIT 10`
    )
    .all(req.session.user.id);

  res.json(activity);
});

export default router;