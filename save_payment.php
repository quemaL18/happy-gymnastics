<?php
header('Content-Type: application/json; charset=utf-8');
require 'init_db.php';

try {
    $db = getDB();

    $child_fio = trim($_POST['child_fio'] ?? '');
    $parent_fio = trim($_POST['parent_fio'] ?? '');
    $plan = trim($_POST['plan'] ?? '');
    $amount = trim($_POST['amount'] ?? '');
    $email = trim($_POST['email'] ?? '');

    if ($child_fio === '' || $parent_fio === '' || $plan === '' || $amount === '' || $email === '') {
        echo json_encode([
            'success' => false,
            'message' => 'Заполни все обязательные поля'
        ]);
        exit;
    }

    if (!is_numeric($amount) || (float)$amount <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Некорректная сумма'
        ]);
        exit;
    }

    $token = bin2hex(random_bytes(8));

    $stmt = $db->prepare("
        INSERT INTO payments (
            child_fio, parent_fio, plan, amount, email, status, payment_token
        ) VALUES (
            :child_fio, :parent_fio, :plan, :amount, :email, 'pending', :payment_token
        )
    ");

    $stmt->execute([
        ':child_fio' => $child_fio,
        ':parent_fio' => $parent_fio,
        ':plan' => $plan,
        ':amount' => $amount,
        ':email' => $email,
        ':payment_token' => $token
    ]);

    echo json_encode([
        'success' => true,
        'payment_id' => $db->lastInsertId(),
        'payment_token' => $token,
        'amount' => $amount,
        'message' => 'Платёж создан'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка: ' . $e->getMessage()
    ]);
}