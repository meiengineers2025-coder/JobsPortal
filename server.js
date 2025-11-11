require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const bodyParser = require("body-parser");
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

// Create tables if not exist
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
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        store: new SQLiteStore({ db: "sessions.sqlite", dir: "./sql" }),
        secret: "superSecretKeyForSessions",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    })
);

// Expose session to views
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// ---------------------
// ROUTES
// ---------------------

// Default route → login page
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Login page
app.get("/login", (req, res) => {
    res.render("login");
});

// Handle login form
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) console.log(err);

        if (!user) {
            req.session.message = "Invalid email or password";
            return res.redirect("/login");
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.session.message = "Invalid email or password";
            return res.redirect("/login");
        }

        req.session.user = { id: user.id, email: user.email };
        res.redirect("/dashboard");
    });
});

// Dashboard (protected)
app.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        req.session.message = "Please login first";
        return res.redirect("/login");
    }
    res.render("dashboard");
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// ---------------------
// START SERVER
// ---------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});