<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../verification.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$body = readJsonBody();
$email = trim(strtolower($body['email'] ?? ''));
$code = trim($body['code'] ?? '');
$password = $body['password'] ?? '';

if ($email === '' || $code === '' || $password === '') {
    jsonResponse(['error' => 'Email, verification code, and new password are required.'], 400);
}

$passwordError = validatePasswordStrength($password);
if ($passwordError) {
    jsonResponse(['error' => $passwordError], 400);
}

$pdo = getDb();
ensureVerificationSchema($pdo);

$row = verifyEmailCode($pdo, $email, $code, 'password_reset');
if (!$row) {
    jsonResponse(['error' => 'Invalid or expired verification code.'], 400);
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND is_active = 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['error' => 'Account not found.'], 404);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, $user['id']]);
$pdo->prepare('DELETE FROM auth_tokens WHERE user_id = ?')->execute([$user['id']]);

jsonResponse(['success' => true, 'message' => 'Password updated successfully. You can now sign in.']);
