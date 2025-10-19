<?php
require_once 'connect.php';

$username = trim($_POST['username']);
$email = trim($_POST['email']);
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);

try {
    $stmt = $db->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$username, $email, $password]);
    echo json_encode(["success" => true, "message" => "تم التسجيل بنجاح، بانتظار الموافقة من الإدارة."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "حدث خطأ: " . $e->getMessage()]);
}
?>
