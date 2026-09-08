<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $includeInactive = isset($_GET['all']) && $_GET['all'] === '1';
    if ($includeInactive) {
        getAuthenticatedUser(['staff', 'admin']);
    }

    $sql = $includeInactive
        ? 'SELECT * FROM products ORDER BY id ASC'
        : 'SELECT * FROM products WHERE is_active = 1 ORDER BY id ASC';

    $rows = $pdo->query($sql)->fetchAll();
    jsonResponse(['products' => array_map('formatProduct', $rows)]);
}

if ($method === 'POST') {
    getAuthenticatedUser(['staff', 'admin']);
    $body = readJsonBody();

    $required = ['name', 'category', 'price', 'image', 'description', 'fullDescription'];
    foreach ($required as $field) {
        if (empty($body[$field])) {
            jsonResponse(['error' => "Field '$field' is required."], 400);
        }
    }

    $stmt = $pdo->prepare(
        'INSERT INTO products (name, category, price, original_price, image, images, colors, sizes,
         description, full_description, shipping_info, badge, rating, reviews, stock, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $body['name'],
        $body['category'],
        $body['price'],
        $body['originalPrice'] ?? null,
        $body['image'],
        json_encode($body['images'] ?? [$body['image']]),
        json_encode($body['colors'] ?? ['Default']),
        json_encode($body['sizes'] ?? ['One Size']),
        $body['description'],
        $body['fullDescription'],
        $body['shippingInfo'] ?? '',
        $body['badge'] ?? null,
        $body['rating'] ?? 0,
        $body['reviews'] ?? 0,
        $body['stock'] ?? 100,
        isset($body['isActive']) ? (int) (bool) $body['isActive'] : 1,
    ]);

    $id = (int) $pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    jsonResponse(['product' => formatProduct($stmt->fetch())], 201);
}

jsonResponse(['error' => 'Method not allowed.'], 405);
