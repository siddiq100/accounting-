<?php
require_once 'connect.php';

$username = trim($_POST['username']);
$password = trim($_POST['password']);

$stmt = $db->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    if (!password_verify($password, $user['password'])) {
        echo json_encode(["success" => false, "message" => "كلمة المرور غير صحيحة"]);
    } elseif ($user['approved'] == 0) {
        echo json_encode(["success" => false, "message" => "لم تتم الموافقة على حسابك بعد"]);
    } else {
        echo json_encode(["success" => true, "message" => "تم تسجيل الدخول بنجاح"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "المستخدم غير موجود"]);
}
?>
