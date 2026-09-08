<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../config.php';

try {

    $input = json_decode(
        file_get_contents('php://input'),
        true
    );

    $email = strtolower(
        trim($input['email'] ?? '')
    );

    $code = trim(
        $input['code'] ?? ''
    );

    $purpose = $input['purpose'] ?? '';

    if (
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        !preg_match('/^\d{6}$/', $code)
    ) {

        http_response_code(400);

        echo json_encode([
            'message' => 'Invalid verification code.'
        ]);

        exit;
    }

    if (!in_array($purpose, [
        'account_verification',
        'password_reset'
    ], true)) {

        http_response_code(400);

        echo json_encode([
            'message' => 'Invalid verification request.'
        ]);

        exit;
    }

    $pdo = new PDO(
        'mysql:host=' . DB_HOST .
        ';dbname=' . DB_NAME .
        ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    $stmt = $pdo->prepare("
        SELECT *
        FROM email_verifications
        WHERE email = ?
        AND purpose = ?
        AND verified_at IS NULL
        AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
    ");

    $stmt->execute([
        $email,
        $purpose
    ]);

    $verification = $stmt->fetch();

    if (!$verification) {

        http_response_code(400);

        echo json_encode([
            'message' =>
                'The verification code is invalid or has expired.'
        ]);

        exit;
    }

    // Check code
    if (!password_verify(
        $code,
        $verification['code_hash']
    )) {

        $update = $pdo->prepare("
            UPDATE email_verifications
            SET attempts = attempts + 1
            WHERE id = ?
        ");

        $update->execute([
            $verification['id']
        ]);

        http_response_code(400);

        echo json_encode([
            'message' => 'Incorrect verification code.'
        ]);

        exit;
    }

    // Mark verified
    $update = $pdo->prepare("
        UPDATE email_verifications
        SET verified_at = NOW()
        WHERE id = ?
    ");

    $update->execute([
        $verification['id']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Verification successful.'
    ]);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'message' => APP_DEBUG
            ? $e->getMessage()
            : 'Something went wrong.'
    ]);
}