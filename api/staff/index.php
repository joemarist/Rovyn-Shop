<?php
require_once __DIR__ . '/../bootstrap.php';

getAuthenticatedUser(['admin']);

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT id, username, email, first_name, last_name, phone, role, is_active, created_at
         FROM users WHERE role = 'staff' ORDER BY created_at DESC"
    );
    $staff = array_map(fn($row) => [
        'id' => (int) $row['id'],
        'username' => $row['username'],
        'email' => $row['email'],
        'firstName' => $row['first_name'],
        'lastName' => $row['last_name'],
        'phone' => $row['phone'],
        'isActive' => (bool) $row['is_active'],
        'createdAt' => $row['created_at'],
    ], $stmt->fetchAll());

    jsonResponse(['staff' => $staff]);
}

if ($method === 'POST') {
    $body = readJsonBody();
    $username = trim($body['username'] ?? '');
    $email = trim(strtolower($body['email'] ?? ''));
    $password = $body['password'] ?? '';
    $firstName = trim($body['firstName'] ?? '');
    $lastName = trim($body['lastName'] ?? '');
    $phone = trim($body['phone'] ?? '');

    if ($username === '' || $email === '' || $password === '') {
        jsonResponse(['error' => 'Username, email, and password are required.'], 400);
    }

    if (strlen($password) < 6) {
        jsonResponse(['error' => 'Password must be at least 6 characters.'], 400);
    }

    $check = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
    $check->execute([$username, $email]);
    if ($check->fetch()) {
        jsonResponse(['error' => 'Username or email already exists.'], 409);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare(
        'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$username, $email, $hash, $firstName, $lastName, $phone, 'staff']);

    $id = (int) $pdo->lastInsertId();
    jsonResponse([
        'staff' => [
            'id' => $id,
            'username' => $username,
            'email' => $email,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'phone' => $phone,
            'isActive' => true,
        ],
    ], 201);
}

jsonResponse(['error' => 'Method not allowed.'], 405);
