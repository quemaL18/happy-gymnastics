<?php
header('Content-Type: application/json; charset=utf-8');
require 'init_db.php';

try {
    $db = getDB();

    $stmt = $db->prepare("
        INSERT INTO applications
        (parent_name, phone, child_name, child_age, direction, comment)
        VALUES
        (:parent_name, :phone, :child_name, :child_age, :direction, :comment)
    ");

    $stmt->execute([
        ':parent_name' => $_POST['parent_name'] ?? '',
        ':phone' => $_POST['phone'] ?? '',
        ':child_name' => $_POST['child_name'] ?? '',
        ':child_age' => $_POST['child_age'] ?? null,
        ':direction' => $_POST['direction'] ?? '',
        ':comment' => $_POST['comment'] ?? ''
    ]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}