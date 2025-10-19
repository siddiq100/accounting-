const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// إعداد قاعدة البيانات
const db = new sqlite3.Database('./database.db');

// إنشاء الجداول إذا لم تكن موجودة
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        approved INTEGER DEFAULT 1
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        date TEXT,
        total REAL,
        paid REAL DEFAULT 0,
        FOREIGN KEY(client_id) REFERENCES clients(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS debts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        amount REAL,
        description TEXT,
        FOREIGN KEY(client_id) REFERENCES clients(id)
    )`);
});

// إعداد Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`💠 Genius Accountant يعمل على: http://localhost:${PORT}`);
});
