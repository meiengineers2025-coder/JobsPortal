require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------
// DATABASE (SQLite)
// ---------------------
const db = new sqlite3.Database("./sql/database.sqlite", (err) => {
    if (err) return console.error(err);
    console.log("✅ SQLite Database Connected");
});

// Create table if not exists
db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`
);

// ---------------------
// MIDDLEWARE
// ---------------------
app.set("view engine", "ejs");

// ✅ Your views folder is in ROOT, not in /src
app.set("views", path.join(__dirname, "views"));

// ✅ Serve static files (CSS / images / JS)
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

// ✅ Sessions stored in SQLite
app.use(
    session({
        store: new SQLiteStore({ db: "sessions.sqlite", dir: "./sql" }),
        secret: process.env.SESSION_SECRET || "superSecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    })
);

// Pass user + flash messages to all EJS files
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// ---------------------
// ROUTES
// ---------------------

app.get("/", (req, res) => {
    res.redirect("/auth/login");
});

// ✅ LOGIN PAGE (GET)
app.get("/auth/login", (req, res) => {
    res.render("auth/login");
});

// ✅ LOGIN (POST)
app.post("/auth/login", (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) console.log(err);

        if (!user) {
            req.session.message = "Invalid email or password";
            return res.redirect("/auth/login");
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.session.message = "Invalid email or password";
            return res.redirect("/auth/login");
        }

        req.session.user = { id: user.id, email: user.email };
        res.redirect("/candidate/dashboard"); // change if needed
    });
});

// ✅ DASHBOARD (protected)
app.get("/candidate/dashboard", (req, res) => {
    if (!req.session.user) {
        req.session.message = "Please login first";
        return res.redirect("/auth/login");
    }
    res.render("candidate/dashboard");
});

// ✅ LOGOUT
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/auth/login");
    });
});

// ---------------------
// START SERVER
// ---------------------
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));