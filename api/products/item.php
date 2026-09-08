<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

if ($id <= 0) {
    jsonResponse(['error' => 'Product ID is required.'], 400);
}

if ($method === 'GET') {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) {
        jsonResponse(['error' => 'Product not found.'], 404);
    }
    jsonResponse(['product' => formatProduct($row)]);
}

getAuthenticatedUser(['staff', 'admin']);

if ($method === 'PUT') {
    $body = readJsonBody();
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Product not found.'], 404);
    }

    $fields = [];
    $values = [];
    $map = [
        'name' => 'name',
        'category' => 'category',
        'price' => 'price',
        'originalPrice' => 'original_price',
        'image' => 'image',
        'description' => 'description',
        'fullDescription' => 'full_description',
        'shippingInfo' => 'shipping_info',
        'badge' => 'badge',
        'rating' => 'rating',
        'reviews' => 'reviews',
        'stock' => 'stock',
    ];

    foreach ($map as $jsonKey => $dbCol) {
        if (array_key_exists($jsonKey, $body)) {
            $fields[] = "$dbCol = ?";
            $values[] = $body[$jsonKey];
        }
    }

    foreach (['images' => 'images', 'colors' => 'colors', 'sizes' => 'sizes'] as $jsonKey => $dbCol) {
        if (array_key_exists($jsonKey, $body)) {
            $fields[] = "$dbCol = ?";
            $values[] = json_encode($body[$jsonKey]);
        }
    }

    if (array_key_exists('isActive', $body)) {
        $fields[] = 'is_active = ?';
        $values[] = (int) (bool) $body['isActive'];
    }

    if (empty($fields)) {
        jsonResponse(['error' => 'No fields to update.'], 400);
    }

    $values[] = $id;
    $pdo->prepare('UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($values);

    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    jsonResponse(['product' => formatProduct($stmt->fetch())]);
}

if ($method === 'DELETE') {
    $stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Product not found.'], 404);
    }

    $pdo->prepare('UPDATE products SET is_active = 0 WHERE id = ?')->execute([$id]);
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed.'], 405);
