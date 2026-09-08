<?php
require_once __DIR__ . '/../../bootstrap.php';

getAuthenticatedUser(['admin']);

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

if ($id <= 0) {
    jsonResponse(['error' => 'Staff ID is required.'], 400);
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? AND role = 'staff'");
$stmt->execute([$id]);
$staff = $stmt->fetch();

if (!$staff) {
    jsonResponse(['error' => 'Staff member not found.'], 404);
}

if ($method === 'PUT') {
    $body = readJsonBody();
    $fields = [];
    $values = [];

    $map = [
        'username' => 'username',
        'email' => 'email',
        'firstName' => 'first_name',
        'lastName' => 'last_name',
        'phone' => 'phone',
    ];

    foreach ($map as $jsonKey => $dbCol) {
        if (array_key_exists($jsonKey, $body) && $body[$jsonKey] !== '') {
            $fields[] = "$dbCol = ?";
            $values[] = trim($body[$jsonKey]);
        }
    }

    if (!empty($body['password'])) {
        if (strlen($body['password']) < 6) {
            jsonResponse(['error' => 'Password must be at least 6 characters.'], 400);
        }
        $fields[] = 'password_hash = ?';
        $values[] = password_hash($body['password'], PASSWORD_DEFAULT);
    }

    if (array_key_exists('isActive', $body)) {
        $fields[] = 'is_active = ?';
        $values[] = (int) (bool) $body['isActive'];
    }

    if (empty($fields)) {
        jsonResponse(['error' => 'No fields to update.'], 400);
    }

    $values[] = $id;
    $pdo->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($values);

    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $updated = $stmt->fetch();

    jsonResponse([
        'staff' => [
            'id' => (int) $updated['id'],
            'username' => $updated['username'],
            'email' => $updated['email'],
            'firstName' => $updated['first_name'],
            'lastName' => $updated['last_name'],
            'phone' => $updated['phone'],
            'isActive' => (bool) $updated['is_active'],
        ],
    ]);
}

if ($method === 'DELETE') {
    $pdo->prepare('UPDATE users SET is_active = 0 WHERE id = ?')->execute([$id]);
    $pdo->prepare('DELETE FROM auth_tokens WHERE user_id = ?')->execute([$id]);
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed.'], 405);
