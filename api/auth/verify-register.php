<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../verification.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$body = readJsonBody();
$email = trim(strtolower($body['email'] ?? ''));
$code = trim($body['code'] ?? '');

if ($email === '' || $code === '') {
    jsonResponse(['error' => 'Email and verification code are required.'], 400);
}

$pdo = getDb();
ensureVerificationSchema($pdo);

$row = verifyEmailCode($pdo, $email, $code, 'registration');
if (!$row) {
    jsonResponse(['error' => 'Invalid or expired verification code.'], 400);
}

$payload = json_decode($row['payload'] ?? '{}', true);
if (!is_array($payload) || empty($payload['password'])) {
    jsonResponse(['error' => 'Registration data is invalid. Please sign up again.'], 400);
}

$passwordError = validatePasswordStrength($payload['password']);
if ($passwordError) {
    jsonResponse(['error' => $passwordError], 400);
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['error' => 'An account with this email already exists.'], 409);
}

$hash = password_hash($payload['password'], PASSWORD_DEFAULT);
$stmt = $pdo->prepare(
    'INSERT INTO users (email, password_hash, first_name, last_name, phone, role, email_verified)
     VALUES (?, ?, ?, ?, ?, ?, 1)'
);
$stmt->execute([
    $email,
    $hash,
    $payload['firstName'] ?? '',
    $payload['lastName'] ?? '',
    $payload['phone'] ?? '',
    'customer',
]);

$userId = (int) $pdo->lastInsertId();
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

$token = createAuthToken($pdo, $userId);

jsonResponse([
    'token' => $token,
    'user' => formatUser($user),
], 201);
