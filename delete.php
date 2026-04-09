<?php
require 'init_db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: admin.php');
    exit;
}

$type = $_POST['type'] ?? '';
$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if ($id <= 0) {
    header('Location: admin.php');
    exit;
}

try {
    $db = getDB();

    if ($type === 'application') {
        $stmt = $db->prepare("DELETE FROM applications WHERE id = :id");
        $stmt->execute([':id' => $id]);
    } elseif ($type === 'payment') {
        $stmt = $db->prepare("DELETE FROM payments WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }

} catch (Exception $e) {
    die('Ошибка удаления: ' . htmlspecialchars($e->getMessage()));
}

header('Location: admin.php');
exit;