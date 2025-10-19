const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// إنشاء الجداول إذا لم تكن موجودة
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        approved INTEGER DEFAULT 0
    )`);
});

// تسجيل مستخدم جديد
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const stmt = db.prepare("INSERT INTO users (username, password, approved) VALUES (?, ?, ?)");
    stmt.run(username, password, 1, function(err) {
        if (err) {
            document.getElementById('registerMessage').innerText = 'اسم المستخدم موجود بالفعل!';
        } else {
            document.getElementById('registerMessage').innerText = 'تم التسجيل بنجاح!';
        }
    });
    stmt.finalize();
});

// تسجيل الدخول
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    db.get("SELECT * FROM users WHERE username = ? AND password = ? AND approved = 1", [username, password], (err, row) => {
        if (row) {
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('loginMessage').innerText = 'بيانات غير صحيحة أو الحساب لم يتم تفعيله!';
        }
    });
});
