<?php
header('Content-Type: application/json; charset=utf-8');
require 'init_db.php';

try {
    $db = getDB();

    $payment_id = (int)($_POST['payment_id'] ?? 0);
    $payment_token = trim($_POST['payment_token'] ?? '');

    if ($payment_id <= 0 || $payment_token === '') {
        echo json_encode([
            'success' => false,
            'message' => 'Некорректные данные платежа'
        ]);
        exit;
    }

    $stmt = $db->prepare("
        UPDATE payments
        SET status = 'paid',
            paid_at = CURRENT_TIMESTAMP
        WHERE id = :id
          AND payment_token = :token
          AND status = 'pending'
    ");

    $stmt->execute([
        ':id' => $payment_id,
        ':token' => $payment_token
    ]);

    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Платёж не найден или уже подтверждён'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Оплата подтверждена'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка: ' . $e->getMessage()
    ]);
}