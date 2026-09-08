<?php
require_once __DIR__ . '/../bootstrap.php';

getAuthenticatedUser(['admin']);

$pdo = getDb();

$stats = [
    'totalCustomers' => (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn(),
    'totalStaff' => (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'staff' AND is_active = 1")->fetchColumn(),
    'totalProducts' => (int) $pdo->query('SELECT COUNT(*) FROM products WHERE is_active = 1')->fetchColumn(),
    'totalOrders' => (int) $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn(),
    'pendingOrders' => (int) $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'pending'")->fetchColumn(),
    'revenue' => (float) ($pdo->query("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'cancelled'")->fetchColumn()),
];

jsonResponse(['stats' => $stats]);
