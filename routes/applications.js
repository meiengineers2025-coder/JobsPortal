// routes/applications.js

import express from "express";
import db from "../src/config/db.js";
import { ensureEmployer, ensureCandidate } from "../src/utils/access.js";

const router = express.Router();

/**
 * CANDIDATE — View all applications made by logged-in user
 */
router.get("/candidate/applications", ensureCandidate, (req, res) => {
  const apps = db
    .prepare(
      `SELECT applications.*, jobs.title, jobs.salary_range
       FROM applications
       INNER JOIN jobs ON jobs.id = applications.job_id
       WHERE candidate_id = ?
       ORDER BY applications.created_at DESC`
    )
    .all(req.session.user.id);

  res.render("applications", {
    user: req.session.user,
    applications: apps,
  });
});


/**
 * EMPLOYER — Change application pipeline stage (ATS feature)
 */
router.post("/application/:id/status", ensureEmployer, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.prepare(
    `UPDATE applications SET status = ? WHERE id = ?`
  ).run(status, id);

  res.redirect("back");
});


export default router;