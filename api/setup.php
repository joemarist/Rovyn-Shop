<?php
/**
 * One-time database setup script.
 * Visit: http://localhost/Rovyn-Shop/api/setup.php
 * Or run: php api/setup.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/verification.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $pdo->exec(
        'CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    $pdo->exec('USE `' . DB_NAME . '`');

    $schema = file_get_contents(__DIR__ . '/../database/schema.sql');
    $schema = preg_replace('/CREATE DATABASE[^;]+;/i', '', $schema);
    $schema = preg_replace('/USE\s+\w+\s*;/i', '', $schema);

    $statements = array_filter(
        array_map('trim', explode(';', $schema)),
        fn($s) => $s !== ''
    );

    foreach ($statements as $statement) {
        $lines = array_filter(
            explode("\n", $statement),
            fn($line) => trim($line) !== '' && !str_starts_with(ltrim($line), '--')
        );
        $sql = trim(implode("\n", $lines));
        if ($sql !== '') {
            $pdo->exec($sql);
        }
    }

    ensureVerificationSchema($pdo);
    $pdo->exec('UPDATE users SET email_verified = 1');

    // Admin user: username admin, password admin123
    $adminHash = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare(
        'INSERT IGNORE INTO users (username, email, password_hash, first_name, last_name, role)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute(['admin', 'admin@rovyn.com', $adminHash, 'System', 'Admin', 'admin']);

    $portalHash = password_hash('portal123', PASSWORD_DEFAULT);
    $stmt->execute(['portal', 'portal@rovyn.com', $portalHash, 'Portal', 'User', 'admin']);

    // Demo staff user: username staff, password staff123
    $staffHash = password_hash('staff123', PASSWORD_DEFAULT);
    $stmt->execute(['staff', 'staff@rovyn.com', $staffHash, 'Demo', 'Staff', 'staff']);

    // Seed products if empty
    $count = (int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
    if ($count === 0) {
        $products = getSeedProducts();
        $insert = $pdo->prepare(
            'INSERT INTO products (name, category, price, original_price, image, images, colors, sizes,
             description, full_description, shipping_info, badge, rating, reviews, stock)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        foreach ($products as $p) {
            $insert->execute([
                $p['name'],
                $p['category'],
                $p['price'],
                $p['original_price'] ?? null,
                $p['image'],
                json_encode($p['images']),
                json_encode($p['colors']),
                json_encode($p['sizes']),
                $p['description'],
                $p['full_description'],
                $p['shipping_info'],
                $p['badge'] ?? null,
                $p['rating'],
                $p['reviews'],
                $p['stock'] ?? 100,
            ]);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Database setup complete.',
        'accounts' => [
            'portal' => ['username' => 'portal', 'password' => 'portal123'],
            'staff' => ['username' => 'staff', 'password' => 'staff123'],
        ],
    ], JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_PRETTY_PRINT);
}

function getSeedProducts(): array
{
    return [
        [
            'name' => 'Summit 45L Pack',
            'category' => 'backpacks',
            'price' => 189,
            'image' => 'https://images.unsplash.com/photo-1476979735039-2fdea9e9e407?w=600&h=600&fit=crop&auto=format',
            'images' => [
                'https://images.unsplash.com/photo-1476979735039-2fdea9e9e407?w=900&h=900&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1499803270242-467f7311582d?w=900&h=900&fit=crop&auto=format',
            ],
            'colors' => ['Olive', 'Midnight Black', 'Storm Navy'],
            'sizes' => ['S / 40L', 'M / 45L', 'L / 50L'],
            'rating' => 4.8,
            'reviews' => 312,
            'badge' => 'Best Seller',
            'description' => 'Built for the long haul. Multi-day pack with padded hip belt, hydration sleeve, and rugged ripstop shell.',
            'full_description' => 'The Summit 45L Pack is engineered for multi-day expeditions and weekend adventures alike.',
            'shipping_info' => 'Free shipping on all orders over ₱2,000. Standard delivery 3–5 business days.',
        ],
        [
            'name' => 'Daypack 20L',
            'category' => 'backpacks',
            'price'  => 89,
            'image' => 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600&h=600&fit=crop&auto=format',
            'images' => [
                'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=900&h=900&fit=crop&auto=format',
            ],
            'colors' => ['Forest Green', 'Jet Black', 'Slate Grey'],
            'sizes' => ['One Size'],
            'rating' => 4.6,
            'reviews' => 189,
            'description' => 'Light, quick, ready for anything. The perfect everyday carry for trails or city commutes.',
            'full_description' => 'The Daypack carries more than it lets on with smart internal organization.',
            'shipping_info' => 'Free shipping on all orders over ₱2,000. Standard delivery 3–5 business days.',
        ],
        [
            'name' => 'Base Camp 65L',
            'category' => 'backpacks',
            'price' => 229,
            'image' => 'https://images.unsplash.com/photo-1499803270242-467f7311582d?w=600&h=600&fit=crop&auto=format',
            'images' => [
                'https://images.unsplash.com/photo-1499803270242-467f7311582d?w=900&h=900&fit=crop&auto=format',
            ],
            'colors' => ['Olive', 'Midnight Black'],
            'sizes' => ['M / 60L', 'L / 65L', 'XL / 70L'],
            'rating' => 4.9,
            'reviews' => 74,
            'badge' => 'New',
            'description' => 'For the serious expedition. Bomber capacity, bomber build.',
            'full_description' => 'The Base Camp 65L is Rovyn\'s flagship expedition pack.',
            'shipping_info' => 'Free shipping on all orders over ₱2,000. Standard delivery 3–5 business days.',
        ],
        [
            'name' => 'Ridge Runner Boots',
            'category' => 'footwear',
            'price' => 249,
            'original_price' => 299,
            'image' => 'https://images.unsplash.com/photo-1575987116913-e96e7d490b8a?w=600&h=600&fit=crop&auto=format',
            'images' => [
                'https://images.unsplash.com/photo-1575987116913-e96e7d490b8a?w=900&h=900&fit=crop&auto=format',
            ],
            'colors' => ['Tan Brown', 'Matte Black'],
            'sizes' => ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
            'rating' => 4.7,
            'reviews' => 256,
            'badge' => 'Sale',
            'description' => 'Full-grain leather upper, Vibram outsole, and waterproof membrane.',
            'full_description' => 'The Ridge Runner Boots are built to outlast the trails that test them.',
            'shipping_info' => 'Free shipping on all orders over ₱2,000. Standard delivery 3–5 business days.',
        ],
        [
            'name' => 'Trek Boots Pro',
            'category' => 'footwear',
            'price' => 279,
            'image' => 'https://images.unsplash.com/photo-1530792271526-7ddf516473b3?w=600&h=600&fit=crop&auto=format',
            'images' => [
                'https://images.unsplash.com/photo-1530792271526-7ddf516473b3?w=900&h=900&fit=crop&auto=format',
            ],
            'colors' => ['Black/Grey', 'Brown/Olive'],
            'sizes' => ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
            'rating' => 4.9,
            'reviews' => 143,
            'description' => 'Technical trail boots built for demanding terrain.',
            'full_description' => 'When the trail gets technical, the Trek Boots Pro steps up.',
            'shipping_info' => 'Free shipping on all orders over ₱2,000. Standard delivery 3–5 business days.',
        ],
        [
            'name' => 'Trailhead Jacket',
            'category' => 'apparel',
            'price' => 159,
            'image' => 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=600&h=600&fit=crop&auto=format',
            'images' => [
                'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=900&h=900&fit=crop&auto=format',
            ],
            'colors' => ['Olive', 'Charcoal', 'Burnt Orange'],
            'sizes' => ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            'rating' => 4.6,
            'reviews' => 198,
            'badge' => 'Best Seller',
            'description' => 'Midlayer fleece meets technical shell.',
            'full_description' => 'The Trailhead Jacket is a do-everything midlayer.',
            'shipping_info' => 'Free shipping on all orders over ₱2,000. Standard delivery 3–5 business days.',
        ],
        [
            'name' => 'Windblock Shell',
            'category' => 'apparel',
            'price' => 129,
            'image' => 'https://images.unsplash.com/photo-1567955465163-c355df3b74bf?w=600&h=600&fit=crop&auto=format',
            'images' => [
                'https://images.unsplash.com/photo-1567955465163-c355df3b74bf?w=900&h=900&fit=crop&auto=format',
            ],
            'colors' => ['Safety Orange', 'Midnight Navy', 'Jet Black'],
            'sizes' => ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            'rating' => 4.5,
            'reviews' => 167,
            'description' => 'Ultralight packable hardshell. Packs into its own pocket.',
            'full_description' => 'The Windblock Shell keeps the elements out without slowing you down.',
            'shipping_info' => 'Free shipping on all orders over ₱2,000. Standard delivery 3–5 business days.',
        ],
        [
            'name' => 'Adventure Pack Lite',
            'category' => 'backpacks',
            'price' => 109,
            'image' => 'https://images.unsplash.com/photo-1592388748465-8c4dca8dd703?w=600&h=600&fit=crop&auto=format',
            'images' => [
                'https://images.unsplash.com/photo-1592388748465-8c4dca8dd703?w=900&h=900&fit=crop&auto=format',
            ],
            'colors' => ['Blue/Black', 'Forest Green', 'Slate'],
            'sizes' => ['One Size'],
            'rating' => 4.4,
            'reviews' => 92,
            'description' => 'Fast and light for trail runners and speed hikers.',
            'full_description' => 'Speed is the Adventure Pack Lite\'s whole ethos.',
            'shipping_info' => 'Free shipping on all orders over ₱2,000. Standard delivery 3–5 business days.',
        ],
    ];
}
