<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/helpers.php';

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user = getAuthenticatedUser(['customer', 'staff', 'admin']);
    $status = $_GET['status'] ?? null;

    if (in_array($user['role'], ['staff', 'admin'], true)) {
        $sql = 'SELECT o.*, u.email AS customer_email, u.first_name AS customer_first_name,
                       u.last_name AS customer_last_name
                FROM orders o JOIN users u ON u.id = o.user_id';
        $params = [];
        if ($status) {
            $sql .= ' WHERE o.status = ?';
            $params[] = $status;
        }
        $sql .= ' ORDER BY o.created_at DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    } else {
        $sql = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user['id']]);
    }

    $orders = [];
    foreach ($stmt->fetchAll() as $row) {
        $orders[] = formatOrder($pdo, $row);
    }

    jsonResponse(['orders' => $orders]);
}

if ($method === 'POST') {
    $user = getAuthenticatedUser(['customer']);
    $body = readJsonBody();

    $items = $body['items'] ?? [];
    if (empty($items)) {
        jsonResponse(['error' => 'Order must contain at least one item.'], 400);
    }

    $subtotal = 0;
    foreach ($items as $item) {
        $subtotal += ($item['unitPrice'] ?? 0) * ($item['quantity'] ?? 0);
    }
    $shipping = $subtotal >= 2000 ? 0 : 150;
    $total = $subtotal + $shipping;
    $orderNumber = 'RVN-' . random_int(100000, 999999);

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO orders (user_id, order_number, status, subtotal, shipping_cost, total,
             payment_method, shipping_first_name, shipping_last_name, shipping_email, shipping_phone,
             shipping_address, shipping_city, shipping_province, shipping_zip, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $user['id'],
            $orderNumber,
            'pending',
            $subtotal,
            $shipping,
            $total,
            $body['paymentMethod'] ?? 'card',
            $body['shipping']['firstName'] ?? $user['first_name'],
            $body['shipping']['lastName'] ?? $user['last_name'],
            $body['shipping']['email'] ?? $user['email'],
            $body['shipping']['phone'] ?? $user['phone'],
            $body['shipping']['address'] ?? '',
            $body['shipping']['city'] ?? '',
            $body['shipping']['province'] ?? '',
            $body['shipping']['zip'] ?? '',
            $body['notes'] ?? null,
        ]);

        $orderId = (int) $pdo->lastInsertId();
        $itemStmt = $pdo->prepare(
            'INSERT INTO order_items (order_id, product_id, product_name, quantity, size, color, unit_price)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );

        foreach ($items as $item) {
            $itemStmt->execute([
                $orderId,
                $item['productId'],
                $item['productName'],
                $item['quantity'],
                $item['size'],
                $item['color'],
                $item['unitPrice'],
            ]);
        }

        $pdo->commit();

        $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
        $stmt->execute([$orderId]);
        jsonResponse(['order' => formatOrder($pdo, $stmt->fetch())], 201);
    } catch (Throwable $e) {
        $pdo->rollBack();
        jsonResponse(['error' => 'Failed to create order.'], 500);
    }
}

jsonResponse(['error' => 'Method not allowed.'], 405);
