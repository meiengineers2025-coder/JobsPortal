import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Database file location (Render persistent disk)
const dataDir = "/data";
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "portal.db");

// Reuse DB connection throughout project
const db = new Database(dbPath, {
  verbose: console.log
});

// Enable WAL mode (better performance + concurrency)
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log("✅ DB Connected at:", dbPath);

export default db;