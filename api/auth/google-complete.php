<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../verification.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$body = readJsonBody();
$setupToken = trim($body['setupToken'] ?? '');
$code = trim($body['code'] ?? '');
$passwordMode = $body['passwordMode'] ?? 'random';
$manualPassword = $body['password'] ?? '';

if ($setupToken === '' || $code === '') {
    jsonResponse(['error' => 'Setup token and verification code are required.'], 400);
}

$pdo = getDb();
ensureVerificationSchema($pdo);

$row = verifySetupToken($pdo, $setupToken, 'google_signup');
if (!$row || !password_verify($code, $row['code_hash'])) {
    jsonResponse(['error' => 'Invalid or expired verification code.'], 400);
}

$pdo->prepare('UPDATE email_verification_codes SET used_at = NOW() WHERE id = ?')
    ->execute([$row['id']]);

$payload = json_decode($row['payload'] ?? '{}', true);
if (!is_array($payload) || empty($payload['googleId'])) {
    jsonResponse(['error' => 'Setup data is invalid. Please sign in with Google again.'], 400);
}

$email = strtolower($payload['email']);

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? OR google_id = ?');
$stmt->execute([$email, $payload['googleId']]);
if ($stmt->fetch()) {
    jsonResponse(['error' => 'An account with this email already exists.'], 409);
}

if ($passwordMode === 'manual') {
    $passwordError = validatePasswordStrength($manualPassword);
    if ($passwordError) {
        jsonResponse(['error' => $passwordError], 400);
    }
    $plainPassword = $manualPassword;
} else {
    $plainPassword = generateSecurePassword();
}

$hash = password_hash($plainPassword, PASSWORD_DEFAULT);

$insert = $pdo->prepare(
    'INSERT INTO users (email, google_id, password_hash, first_name, last_name, avatar_url, role, email_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)'
);
$insert->execute([
    $email,
    $payload['googleId'],
    $hash,
    $payload['firstName'] ?? '',
    $payload['lastName'] ?? '',
    $payload['avatarUrl'] ?? null,
    'customer',
]);

$userId = (int) $pdo->lastInsertId();
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

$token = createAuthToken($pdo, $userId);

$response = [
    'token' => $token,
    'user' => formatUser($user),
    'message' => 'Account created successfully.',
];

if ($passwordMode === 'random' && APP_DEBUG) {
    $response['generatedPassword'] = $plainPassword;
    $response['passwordNote'] = 'Save this password — you can use it to sign in with email and password.';
}

jsonResponse($response, 201);
