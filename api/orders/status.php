<?php
require_once __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

getAuthenticatedUser(['staff', 'admin']);

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    jsonResponse(['error' => 'Order ID is required.'], 400);
}

$body = readJsonBody();
$status = $body['status'] ?? '';
$allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

if (!in_array($status, $allowed, true)) {
    jsonResponse(['error' => 'Invalid status.'], 400);
}

$pdo = getDb();
$stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
$stmt->execute([$id]);
$order = $stmt->fetch();

if (!$order) {
    jsonResponse(['error' => 'Order not found.'], 404);
}

$pdo->prepare('UPDATE orders SET status = ? WHERE id = ?')->execute([$status, $id]);

$stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
$stmt->execute([$id]);
$updated = $stmt->fetch();

require_once __DIR__ . '/helpers.php';
jsonResponse(['order' => formatOrder($pdo, $updated)]);
