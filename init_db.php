<?php
function getDB() {
    $db = new PDO('sqlite:database.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $db->exec("
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            child_name TEXT,
            child_age INTEGER,
            direction TEXT,
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            child_fio TEXT NOT NULL,
            parent_fio TEXT NOT NULL,
            plan TEXT NOT NULL,
            amount REAL NOT NULL,
            email TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            payment_token TEXT,
            paid_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");

    $columns = $db->query("PRAGMA table_info(payments)")->fetchAll(PDO::FETCH_ASSOC);
    $columnNames = array_column($columns, 'name');

    if (!in_array('payment_token', $columnNames, true)) {
        $db->exec("ALTER TABLE payments ADD COLUMN payment_token TEXT");
    }

    if (!in_array('paid_at', $columnNames, true)) {
        $db->exec("ALTER TABLE payments ADD COLUMN paid_at DATETIME");
    }

    return $db;
}