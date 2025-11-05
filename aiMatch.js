// src/services/aiMatch.js
// AI-assisted matching (optional OpenAI embeddings). Falls back to keyword scoring if no API key.

import OpenAI from "openai";

// Create client only if API key is present
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// --- small helpers ---
function cosine(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

function extractKeywords(text = "") {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9,\s]/g, " ")
    .split(/[\s,]+/)
    .filter(Boolean);
}

// --- public API ---

/**
 * Get an embedding vector for any text (returns null if OpenAI not configured)
 */
export async function embedText(text) {
  if (!client) return null;
  const out = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return out.data?.[0]?.embedding || null;
}

/**
 * Compute a 0–100 match score between candidate and job.
 * Uses embeddings if available; otherwise falls back to keyword overlap.
 */
export async function matchScore({ candidate, job }) {
  const cTxt = [
    candidate?.education,
    candidate?.skills,
    candidate?.comments,
    `${candidate?.experience_years || 0} years`,
  ]
    .filter(Boolean)
    .join("\n");

  const jTxt = [
    job?.title,
    job?.education,
    job?.skills,
    job?.comments,
    `${job?.experience_years || 0} years`,
  ]
    .filter(Boolean)
    .join("\n");

  // Try embeddings first
  try {
    const [cEmb, jEmb] = await Promise.all([embedText(cTxt), embedText(jTxt)]);
    if (cEmb && jEmb) {
      const score = Math.max(0, Math.min(100, Math.round(cosine(cEmb, jEmb) * 100)));
      return score;
    }
  } catch (e) {
    // silently fall back
    console.warn("Embedding match failed, using keyword fallback:", e?.message);
  }

  // Fallback: keyword overlap + experience proximity + education hint
  const cKeys = new Set(extractKeywords(cTxt));
  const jKeys = new Set(extractKeywords(jTxt));

  let overlap = 0;
  jKeys.forEach((k) => {
    if (cKeys.has(k)) overlap++;
  });

  // Normalize overlap to 0–70
  const base = Math.min(70, Math.round((overlap / Math.max(5, jKeys.size)) * 70));

  // Experience proximity (0–20)
  const expGap = Math.abs((candidate?.experience_years || 0) - (job?.experience_years || 0));
  const expScore = Math.max(0, 20 - Math.min(20, expGap * 4));

  // Education (0 or 10)
  const eduScore =
    candidate?.education && job?.education &&
    candidate.education.toLowerCase().includes(job.education.toLowerCase())
      ? 10
      : 0;

  return Math.max(0, Math.min(100, base + expScore + eduScore));
}