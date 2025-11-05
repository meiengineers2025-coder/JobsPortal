const express = require("express");
const router = express.Router();
const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// ------------------------------------------
// MIDDLEWARE — CHECK IF CANDIDATE IS LOGGED IN
// ------------------------------------------
function isCandidate(req, res, next) {
  if (!req.session.user || req.session.user.role !== "candidate") {
    return res.redirect("/login");
  }
  next();
}

// ------------------------------------------
// CANDIDATE DASHBOARD
// ------------------------------------------
router.get("/dashboard", isCandidate, (req, res) => {
  const userId = req.session.user.id;

  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) throw err;
    res.render("candidate/dashboard", { candidate: result[0] });
  });
});

// ------------------------------------------
// UPDATE CANDIDATE PROFILE (Resume Upload)
// ------------------------------------------
router.get("/profile", isCandidate, (req, res) => {
  const userId = req.session.user.id;

  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) throw err;
    res.render("candidate/profile", { candidate: result[0] });
  });
});

router.post("/profile", isCandidate, (req, res) => {
  const userId = req.session.user.id;
  const { name, email, skills } = req.body;

  // Resume upload
  let resumeFile = null;

  if (req.files && req.files.resume) {
    resumeFile = Date.now() + "-" + req.files.resume.name;
    const uploadPath = path.join("uploads/resumes", resumeFile);

    req.files.resume.mv(uploadPath, (err) => {
      if (err) throw err;
    });
  }

  const updateQuery = resumeFile
    ? "UPDATE users SET name = ?, email = ?, skills = ?, resumeFile = ? WHERE id = ?"
    : "UPDATE users SET name = ?, email = ?, skills = ? WHERE id = ?";

  const params = resumeFile
    ? [name, email, skills, resumeFile, userId]
    : [name, email, skills, userId];

  db.query(updateQuery, params, () => {
    res.redirect("/candidate/dashboard");
  });
});

// ------------------------------------------
// APPLY TO A JOB
// ------------------------------------------
router.post("/apply/:jobId", isCandidate, (req, res) => {
  const candidateId = req.session.user.id;
  const jobId = req.params.jobId;

  db.query(
    "INSERT INTO applications (candidateId, jobId, status, appliedOn) VALUES (?, ?, 'applied', NOW())",
    [candidateId, jobId],
    (err) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/candidate/applications");
    }
  );
});

// ------------------------------------------
// VIEW APPLICATIONS
// ------------------------------------------
router.get("/applications", isCandidate, (req, res) => {
  const userId = req.session.user.id;

  db.query(
    `SELECT applications.*, jobs.title AS jobTitle, jobs.companyName
     FROM applications 
     JOIN jobs ON applications.jobId = jobs.id
     WHERE applications.candidateId = ?`,
    [userId],
    (err, result) => {
      if (err) throw err;
      res.render("candidate/applications", { applications: result });
    }
  );
});

module.exports = router;