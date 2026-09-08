<?php

require_once __DIR__ . '/config.php';

function handleCors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    $allowed = ['http://localhost:8443', 'http://127.0.0.1:8443', 'http://localhost', 'http://127.0.0.1'];

    if (in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        header('Access-Control-Allow-Origin: *');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function getDb(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    }
    return $pdo;
}

function jsonResponse(array $data, int $code = 200): never
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function getBearerToken(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    if ($header === '' && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if ($header === '' && function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                $header = $value;
                break;
            }
        }
    }

    if (preg_match('/Bearer\s+(\S+)/i', $header, $matches)) {
        return $matches[1];
    }
    return null;
}

function formatUser(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'username' => $row['username'],
        'email' => $row['email'],
        'firstName' => $row['first_name'],
        'lastName' => $row['last_name'],
        'phone' => $row['phone'],
        'role' => $row['role'],
        'avatarUrl' => $row['avatar_url'],
    ];
}

function createAuthToken(PDO $pdo, int $userId): string
{
    $token = bin2hex(random_bytes(32));
    $expires = (new DateTime('+' . AUTH_TOKEN_DAYS . ' days'))->format('Y-m-d H:i:s');

    $stmt = $pdo->prepare('INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)');
    $stmt->execute([$userId, $token, $expires]);

    return $token;
}

function getAuthenticatedUser(?array $allowedRoles = null): array
{
    $token = getBearerToken();
    if (!$token) {
        jsonResponse(['error' => 'Authentication required.'], 401);
    }

    $pdo = getDb();
    $stmt = $pdo->prepare(
        'SELECT u.* FROM users u
         JOIN auth_tokens t ON t.user_id = u.id
         WHERE t.token = ? AND t.expires_at > NOW() AND u.is_active = 1'
    );
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(['error' => 'Invalid or expired session.'], 401);
    }

    if ($allowedRoles !== null && !in_array($user['role'], $allowedRoles, true)) {
        jsonResponse(['error' => 'Access denied.'], 403);
    }

    return $user;
}

function formatProduct(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'category' => $row['category'],
        'price' => (float) $row['price'],
        'originalPrice' => $row['original_price'] !== null ? (float) $row['original_price'] : null,
        'image' => $row['image'],
        'images' => json_decode($row['images'], true) ?: [],
        'colors' => json_decode($row['colors'], true) ?: [],
        'sizes' => json_decode($row['sizes'], true) ?: [],
        'description' => $row['description'],
        'fullDescription' => $row['full_description'],
        'shippingInfo' => $row['shipping_info'] ?? '',
        'badge' => $row['badge'],
        'rating' => (float) $row['rating'],
        'reviews' => (int) $row['reviews'],
        'stock' => (int) $row['stock'],
        'isActive' => (bool) $row['is_active'],
    ];
}

function verifyGoogleToken(string $idToken): ?array
{
    $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);
    $response = @file_get_contents($url);
    if ($response === false) {
        return null;
    }

    $payload = json_decode($response, true);
    if (!is_array($payload) || empty($payload['email'])) {
        return null;
    }

    if (defined('GOOGLE_CLIENT_ID') && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
        if (($payload['aud'] ?? '') !== GOOGLE_CLIENT_ID) {
            return null;
        }
    }

    return $payload;
}

handleCors();
