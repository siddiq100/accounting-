<?php
$dbPath = __DIR__ . '/../database/app.db';

try {
    $db = new PDO("sqlite:" . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die("فشل الاتصال بقاعدة البيانات: " . $e->getMessage());
}
?>
