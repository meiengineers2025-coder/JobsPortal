// ──────────────────────────────────────────────
// ✅ SQLite Database Connection
// utils/db.js
// ──────────────────────────────────────────────

const Database = require("better-sqlite3");
const path = require("path");

// Store DB file in project root
const dbPath = path.join(__dirname, "../database.sqlite");

// Opens DB (creates if missing)
const db = new Database(dbPath);

// ──────────────────────────────────────────────
// ✅ Create required tables if not exist
// ──────────────────────────────────────────────

// Users: candidates + employers
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        accountType TEXT,  -- candidate or employer
        resume TEXT
    )
`).run();

// Jobs posted by employers
db.prepare(`
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employerId INTEGER,
        title TEXT,
        location TEXT,
        salary TEXT,
        description TEXT,
        createdAt TEXT,
        FOREIGN KEY (employerId) REFERENCES users(id)
    )
`).run();

// Candidate applications
db.prepare(`
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidateId INTEGER,
        jobId INTEGER,
        status TEXT,
        FOREIGN KEY (candidateId) REFERENCES users(id),
        FOREIGN KEY (jobId) REFERENCES jobs(id)
    )
`).run();

console.log("✅ SQLite Database initialized");

module.exports = db;