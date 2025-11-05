// routes/candidates.js

import express from "express";
import db from "../src/config/db.js";
import { ensureCandidate, ensureLoggedIn } from "../src/utils/access.js";

const router = express.Router();

/**
 * CANDIDATE DASHBOARD
 */
router.get("/candidate/dashboard", ensureCandidate, (req, res) => {
  const candidate = db
    .prepare(`SELECT * FROM candidate_profiles WHERE user_id = ?`)
    .get(req.session.user.id);

  const applications = db
    .prepare(
      `SELECT jobs.title, jobs.salary_range, applications.status
       FROM applications
       JOIN jobs ON jobs.id = applications.job_id
       WHERE applications.candidate_id = ?`
    )
    .all(req.session.user.id);

  res.render("candidate_dashboard", {
    user: req.session.user,
    candidate,
    applications,
  });
});

/**
 * SAVE CANDIDATE PROFILE
 */
router.post("/candidate/profile", ensureCandidate, (req, res) => {
  const { education, experience_years, skills, comments } = req.body;

  db.prepare(
    `INSERT INTO candidate_profiles (user_id, education, experience_years, skills, comments)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
     education = excluded.education,
     experience_years = excluded.experience_years,
     skills = excluded.skills,
     comments = excluded.comments`
  ).run(req.session.user.id, education, experience_years, skills, comments);

  res.redirect("/candidate/dashboard");
});

/**
 * APPLY TO A JOB
 */
router.get("/apply/:job_id", ensureCandidate, (req, res) => {
  db.prepare(
    `INSERT INTO applications (job_id, candidate_id) VALUES (?, ?)`
  ).run(req.params.job_id, req.session.user.id);

  res.redirect("/candidate/dashboard");
});

/**
 * JOB MATCH SWIPE PAGE (Tinder UI)
 */
router.get("/candidate/swipe", ensureCandidate, (req, res) => {
  const jobs = db
    .prepare(
      `SELECT * FROM jobs ORDER BY created_at DESC LIMIT 10`
    )
    .all();

  res.render("swipe", {
    user: req.session.user,
    jobs,
  });
});

export default router;