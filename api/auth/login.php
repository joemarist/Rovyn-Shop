<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../verification.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$body = readJsonBody();
$identifier = trim($body['identifier'] ?? $body['email'] ?? $body['username'] ?? '');
$password = $body['password'] ?? '';

if ($identifier === '' || $password === '') {
    jsonResponse(['error' => 'Email/username and password are required.'], 400);
}

// Hidden portal gate — unlocks credential page, does not create a session
if ($identifier === 'portal' && $password === 'portal123') {
    jsonResponse([
        'portalUnlocked' => true,
        'message' => 'Portal access granted. Enter admin or staff credentials.',
    ]);
}

$pdo = getDb();
$stmt = $pdo->prepare(
    'SELECT * FROM users WHERE (email = ? OR username = ?) AND is_active = 1 LIMIT 1'
);
$stmt->execute([$identifier, $identifier]);
$user = $stmt->fetch();

if (!$user || !$user['password_hash'] || !password_verify($password, $user['password_hash'])) {
    jsonResponse(['error' => 'Invalid credentials.'], 401);
}

if ($user['role'] === 'customer' && !(bool) $user['email_verified']) {
    jsonResponse(['error' => 'Please verify your email before signing in.'], 403);
}

$token = createAuthToken($pdo, (int) $user['id']);

jsonResponse([
    'token' => $token,
    'user' => formatUser($user),
]);
