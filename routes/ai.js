// routes/ai.js
// AI Features: Cover Letter generator, JD writer, Resume improvement

import express from "express";
import { ensureLoggedIn } from "../src/utils/access.js";
import OpenAI from "openai";

const router = express.Router();

// Create OpenAI client only if key is present
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * ✅ AI COVER LETTER GENERATOR
 */
router.post("/ai/cover-letter", ensureLoggedIn, async (req, res) => {
  const { jobTitle, skills, experience } = req.body;

  if (!client) return res.json({ text: "AI disabled (no API key configured)" });

  const prompt = `
Generate a short professional cover letter:

Job Title: ${jobTitle}
Skills: ${skills}
Experience: ${experience} years
Tone: confident, concise, result-oriented.
`;

  const result = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return res.json({ text: result.choices[0].message.content });
});

/**
 * ✅ AI JOB DESCRIPTION WRITER (Employer tool)
 */
router.post("/ai/write-jd", ensureLoggedIn, async (req, res) => {
  const { title, skills, experience, salary } = req.body;

  if (!client) return res.json({ text: "AI disabled (no API key configured)" });

  const prompt = `
Create a job description with:
Role: ${title}
Required Skills: ${skills}
Experience Required: ${experience} years
Offered Salary: ${salary}

Add:
- Job responsibilities
- Required qualifications
- What makes this role attractive
`;

  const result = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  res.json({ text: result.choices[0].message.content });
});

/**
 * ✅ AI RESUME IMPROVER (Candidate tool)
 */
router.post("/ai/improve-resume", ensureLoggedIn, async (req, res) => {
  const { resumeText } = req.body;

  if (!client) return res.json({ text: "AI disabled (no API key configured)" });

  const prompt = `
Improve the following resume text:

${resumeText}

Enhance formatting, impact, and convert into achievement statements.
`;

  const result = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  res.json({ text: result.choices[0].message.content });
});

export default router;