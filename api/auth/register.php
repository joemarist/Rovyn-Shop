<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../verification.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$body = readJsonBody();
$email = trim(strtolower($body['email'] ?? ''));
$password = $body['password'] ?? '';
$firstName = trim($body['firstName'] ?? '');
$lastName = trim($body['lastName'] ?? '');
$phone = trim($body['phone'] ?? '');

if ($email === '' || $password === '') {
    jsonResponse(['error' => 'Email and password are required.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Invalid email address.'], 400);
}

$passwordError = validatePasswordStrength($password);
if ($passwordError) {
    jsonResponse(['error' => $passwordError], 400);
}

$pdo = getDb();
ensureVerificationSchema($pdo);

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['error' => 'An account with this email already exists.'], 409);
}

$payload = [
    'email' => $email,
    'password' => $password,
    'firstName' => $firstName,
    'lastName' => $lastName,
    'phone' => $phone,
];

$code = storeVerificationCode($pdo, $email, 'registration', $payload);
$mailResult = dispatchVerificationCode($email, $code, 'registration');

jsonResponse([
    'needsVerification' => true,
    'email' => $email,
    'message' => 'A verification code has been sent to your email.',
    ...$mailResult,
], 202);
