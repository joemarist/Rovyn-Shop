<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../verification.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$body = readJsonBody();
$credential = $body['credential'] ?? '';

if ($credential === '') {
    jsonResponse(['error' => 'Google credential is required.'], 400);
}

$payload = verifyGoogleToken($credential);
if (!$payload) {
    jsonResponse(['error' => 'Invalid Google token.'], 401);
}

$googleId = $payload['sub'];
$email = strtolower($payload['email']);
$name = $payload['name'] ?? '';
$picture = $payload['picture'] ?? null;
$nameParts = explode(' ', $name, 2);
$firstName = $nameParts[0] ?? '';
$lastName = $nameParts[1] ?? '';

$pdo = getDb();
ensureVerificationSchema($pdo);

$stmt = $pdo->prepare('SELECT * FROM users WHERE google_id = ? OR email = ? LIMIT 1');
$stmt->execute([$googleId, $email]);
$user = $stmt->fetch();

if ($user) {
    if (!$user['google_id']) {
        $update = $pdo->prepare(
            'UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?), email_verified = 1 WHERE id = ?'
        );
        $update->execute([$googleId, $picture, $user['id']]);
    }
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$user['id']]);
    $user = $stmt->fetch();

    if (!$user['is_active']) {
        jsonResponse(['error' => 'Account is deactivated.'], 403);
    }

    $token = createAuthToken($pdo, (int) $user['id']);
    jsonResponse(['token' => $token, 'user' => formatUser($user)]);
}

// New Google user — send verification code and require setup
$setupToken = generateSetupToken();
$googlePayload = [
    'googleId' => $googleId,
    'email' => $email,
    'firstName' => $firstName,
    'lastName' => $lastName,
    'avatarUrl' => $picture,
];

$code = storeVerificationCode($pdo, $email, 'google_signup', $googlePayload, $setupToken);
$mailResult = dispatchVerificationCode($email, $code, 'google_signup');

jsonResponse([
    'needsSetup' => true,
    'setupToken' => $setupToken,
    'email' => $email,
    'firstName' => $firstName,
    'lastName' => $lastName,
    'avatarUrl' => $picture,
    'message' => 'A verification code has been sent to your email to complete sign-up.',
    ...$mailResult,
], 202);
