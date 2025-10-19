<?php
$dbPath = __DIR__ . '/../database/app.db';

if (!file_exists(dirname($dbPath))) {
    mkdir(dirname($dbPath), 0777, true);
}

try {
    $db = new PDO("sqlite:" . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            approved INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");

    echo "✅ تم إنشاء قاعدة البيانات والجداول بنجاح";
} catch (Exception $e) {
    echo "❌ خطأ أثناء الإنشاء: " . $e->getMessage();
}
?>
