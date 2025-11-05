import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// Ensure database path exists (Render uses /data persistent disk)
const dataDir = "/data";
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "portal.db");
console.log("✅ SQLite Database:", dbPath);

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// USERS
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT CHECK(role IN ('employer','candidate')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

// CANDIDATE PROFILE
db.prepare(`
CREATE TABLE IF NOT EXISTS candidate_profiles (
  user_id INTEGER PRIMARY KEY,
  education TEXT,
  experience_years INTEGER,
  skills TEXT,
  comments TEXT,
  resume_file TEXT,
  video_file TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
`).run();

// JOB POSTS
db.prepare(`
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employer_id INTEGER,
  title TEXT,
  education TEXT,
  experience_years INTEGER,
  skills TEXT,
  salary_range TEXT,
  comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employer_id) REFERENCES users(id)
)
`).run();

// APPLICATIONS
db.prepare(`
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER,
  candidate_id INTEGER,
  status TEXT DEFAULT 'applied',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (candidate_id) REFERENCES users(id)
)
`).run();

// PAYMENTS
db.prepare(`
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  role TEXT,
  provider TEXT,
  order_id TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'created',
  amount_paise INTEGER,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

// REFERRALS
db.prepare(`
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id INTEGER,
  referred_email TEXT,
  credited INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

// EMBEDDINGS (AI matching vectors)
db.prepare(`
CREATE TABLE IF NOT EXISTS embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT,
  ref_id INTEGER,
  vector_json TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(kind, ref_id)
)
`).run();

// SALARY INTELLIGENCE (Phase-4)
db.prepare(`
CREATE TABLE IF NOT EXISTS salary_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill TEXT,
  city TEXT,
  experience_level TEXT,
  avg_salary INTEGER,
  demand_score INTEGER,
  companies_json TEXT
)
`).run();

console.log("✅ Database ready.");

export default db;
