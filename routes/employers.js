// routes/employers.js

import express from "express";
import db from "../src/config/db.js";
import { ensureEmployer, ensureLoggedIn } from "../src/utils/access.js";

const router = express.Router();

/**
 * EMPLOYER DASHBOARD
 */
router.get("/employer/dashboard", ensureEmployer, (req, res) => {
  const jobs = db
    .prepare(`SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC`)
    .all(req.session.user.id);

  res.render("employer_dashboard", {
    user: req.session.user,
    jobs,
  });
});

/**
 * POST A NEW JOB
 */
router.post("/employer/post-job", ensureEmployer, (req, res) => {
  const { title, education, experience_years, skills, salary_range, comments } = req.body;

  db.prepare(
    `INSERT INTO jobs (employer_id, title, education, experience_years, skills, salary_range, comments)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    req.session.user.id,
    title,
    education,
    experience_years,
    skills,
    salary_range,
    comments
  );

  res.redirect("/employer/dashboard");
});

/**
 * VIEW CANDIDATES FOR A JOB
 */
router.get("/employer/job/:job_id/candidates", ensureEmployer, (req, res) => {
  const jobId = req.params.job_id;

  const job = db.prepare(`SELECT * FROM jobs WHERE id = ?`).get(jobId);
  const applicants = db.prepare(`
      SELECT applications.*, users.name, users.email, candidate_profiles.skills, candidate_profiles.experience_years
      FROM applications
      JOIN users ON applications.candidate_id = users.id
      JOIN candidate_profiles ON users.id = candidate_profiles.user_id
      WHERE applications.job_id = ?
    `).all(jobId);

  res.render("applications", {
    user: req.session.user,
    job,
    applicants,
  });
});

/**
 * DELETE A JOB POST
 */
router.get("/employer/delete/:job_id", ensureEmployer, (req, res) => {
  db.prepare(`DELETE FROM jobs WHERE id = ? AND employer_id = ?`)
    .run(req.params.job_id, req.session.user.id);

  res.redirect("/employer/dashboard");
});


export default router;
