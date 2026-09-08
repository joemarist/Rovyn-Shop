<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../verification.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$body = readJsonBody();
$email = trim(strtolower($body['email'] ?? ''));
$purpose = $body['purpose'] ?? 'registration';

$allowed = ['registration', 'google_signup', 'password_reset'];
if (!in_array($purpose, $allowed, true)) {
    jsonResponse(['error' => 'Invalid purpose.'], 400);
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Valid email is required.'], 400);
}

$pdo = getDb();
ensureVerificationSchema($pdo);

// For resend during google setup, find latest unused token payload
if ($purpose === 'google_signup') {
    $stmt = $pdo->prepare(
        'SELECT payload FROM email_verification_codes
         WHERE email = ? AND purpose = ? AND used_at IS NULL AND expires_at > NOW()
         ORDER BY id DESC LIMIT 1'
    );
    $stmt->execute([$email, $purpose]);
    $existing = $stmt->fetch();
    if (!$existing) {
        jsonResponse(['error' => 'No pending Google sign-up found. Please sign in with Google again.'], 400);
    }
    $payload = json_decode($existing['payload'], true);
    $setupToken = generateSetupToken();
    $code = storeVerificationCode($pdo, $email, $purpose, $payload, $setupToken);
    $mailResult = dispatchVerificationCode($email, $code, $purpose);
    jsonResponse([
        'success' => true,
        'setupToken' => $setupToken,
        'message' => 'A new verification code has been sent.',
        ...$mailResult,
    ]);
}

if ($purpose === 'registration') {
    $stmt = $pdo->prepare(
        'SELECT payload FROM email_verification_codes
         WHERE email = ? AND purpose = ? AND used_at IS NULL AND expires_at > NOW()
         ORDER BY id DESC LIMIT 1'
    );
    $stmt->execute([$email, $purpose]);
    $existing = $stmt->fetch();
    if (!$existing) {
        jsonResponse(['error' => 'No pending registration found. Please sign up again.'], 400);
    }
    $payload = json_decode($existing['payload'], true);
    $code = storeVerificationCode($pdo, $email, $purpose, $payload);
    $mailResult = dispatchVerificationCode($email, $code, $purpose);
    jsonResponse(['success' => true, 'message' => 'A new verification code has been sent.', ...$mailResult]);
}

// password_reset
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND is_active = 1');
$stmt->execute([$email]);
$user = $stmt->fetch();
if (!$user) {
    jsonResponse(['success' => true, 'message' => 'If an account exists, a new code has been sent.']);
}

$code = storeVerificationCode($pdo, $email, 'password_reset', ['userId' => (int) $user['id']]);
$mailResult = dispatchVerificationCode($email, $code, 'password_reset');
jsonResponse(['success' => true, 'message' => 'A new verification code has been sent.', ...$mailResult]);
