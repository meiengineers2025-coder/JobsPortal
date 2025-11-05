// routes/ats.js
// ATS = Applicant Tracking System (drag & drop hiring pipeline)

import express from "express";
import db from "../src/config/db.js";
import { ensureEmployer } from "../src/utils/access.js";

const router = express.Router();

/**
 * ✅ SHOW ATS PIPELINE FOR A JOB
 */
router.get("/ats/:job_id", ensureEmployer, (req, res) => {
  const jobId = req.params.job_id;

  const job = db.prepare(
    `SELECT * FROM jobs WHERE id = ? AND employer_id = ?`
  ).get(jobId, req.session.user.id);

  if (!job) return res.redirect("/employer/dashboard");

  const candidates = db.prepare(
    `SELECT applications.id, applications.status, users.name, users.email, candidate_profiles.skills
     FROM applications
     JOIN users ON applications.candidate_id = users.id
     LEFT JOIN candidate_profiles ON users.id = candidate_profiles.user_id
     WHERE job_id = ?`
  ).all(jobId);

  res.render("ats", {
    user: req.session.user,
    job,
    candidates,
  });
});

/**
 * ✅ UPDATE CANDIDATE STAGE (drag & drop event)
 * Stages: applied → shortlisted → interview → hired → rejected
 */
router.post("/ats/update-stage", ensureEmployer, (req, res) => {
  const { application_id, new_stage } = req.body;

  db.prepare(
    `UPDATE applications SET status = ? WHERE id = ?`
  ).run(new_stage, application_id);

  return res.json({ success: true });
});

export default router;