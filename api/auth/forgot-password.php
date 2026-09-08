<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../verification.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$body = readJsonBody();
$email = trim(strtolower($body['email'] ?? ''));

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Valid email is required.'], 400);
}

$pdo = getDb();
ensureVerificationSchema($pdo);

$stmt = $pdo->prepare('SELECT id, email, password_hash FROM users WHERE email = ? AND is_active = 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !$user['password_hash']) {
    jsonResponse([
        'success' => true,
        'message' => 'If an account exists with that email, a verification code has been sent.',
    ]);
}

$code = storeVerificationCode($pdo, $email, 'password_reset', ['userId' => (int) $user['id']]);
$mailResult = dispatchVerificationCode($email, $code, 'password_reset');

jsonResponse([
    'success' => true,
    'email' => $email,
    'message' => 'If an account exists with that email, a verification code has been sent.',
    ...$mailResult,
]);
