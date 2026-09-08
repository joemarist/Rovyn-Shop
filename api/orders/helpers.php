<?php

function formatOrder(PDO $pdo, array $row): array
{
    $stmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ?');
    $stmt->execute([$row['id']]);
    $items = array_map(fn($i) => [
        'id' => (int) $i['id'],
        'productId' => (int) $i['product_id'],
        'productName' => $i['product_name'],
        'quantity' => (int) $i['quantity'],
        'size' => $i['size'],
        'color' => $i['color'],
        'unitPrice' => (float) $i['unit_price'],
    ], $stmt->fetchAll());

    $order = [
        'id' => (int) $row['id'],
        'orderNumber' => $row['order_number'],
        'status' => $row['status'],
        'subtotal' => (float) $row['subtotal'],
        'shippingCost' => (float) $row['shipping_cost'],
        'total' => (float) $row['total'],
        'paymentMethod' => $row['payment_method'],
        'shipping' => [
            'firstName' => $row['shipping_first_name'],
            'lastName' => $row['shipping_last_name'],
            'email' => $row['shipping_email'],
            'phone' => $row['shipping_phone'],
            'address' => $row['shipping_address'],
            'city' => $row['shipping_city'],
            'province' => $row['shipping_province'],
            'zip' => $row['shipping_zip'],
        ],
        'items' => $items,
        'createdAt' => $row['created_at'],
    ];

    if (isset($row['customer_email'])) {
        $order['customer'] = [
            'email' => $row['customer_email'],
            'firstName' => $row['customer_first_name'],
            'lastName' => $row['customer_last_name'],
        ];
    }

    return $order;
}
