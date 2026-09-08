<?php
require_once __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$token = getBearerToken();
if ($token) {
    $pdo = getDb();
    $pdo->prepare('DELETE FROM auth_tokens WHERE token = ?')->execute([$token]);
}

jsonResponse(['success' => true]);
