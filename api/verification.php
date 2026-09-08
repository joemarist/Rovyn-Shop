<?php

require_once __DIR__ . '/config.php';

function generateVerificationCode(): string
{
    return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

function generateSetupToken(): string
{
    return bin2hex(random_bytes(32));
}

function generateSecurePassword(): string
{
    $upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    $lower = 'abcdefghjkmnpqrstuvwxyz';
    $digits = '23456789';
    $symbols = '!@#$%&*';

    $password = $upper[random_int(0, strlen($upper) - 1)]
        . $lower[random_int(0, strlen($lower) - 1)]
        . $digits[random_int(0, strlen($digits) - 1)]
        . $symbols[random_int(0, strlen($symbols) - 1)];

    $all = $upper . $lower . $digits . $symbols;
    for ($i = 0; $i < 12; $i++) {
        $password .= $all[random_int(0, strlen($all) - 1)];
    }

    return str_shuffle($password);
}

function validatePasswordStrength(string $password): ?string
{
    if (strlen($password) < 8) {
        return 'Password must be at least 8 characters.';
    }
    if (!preg_match('/[A-Z]/', $password)) {
        return 'Password must contain at least one uppercase letter.';
    }
    if (!preg_match('/[a-z]/', $password)) {
        return 'Password must contain at least one lowercase letter.';
    }
    if (!preg_match('/[0-9]/', $password)) {
        return 'Password must contain at least one number.';
    }
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        return 'Password must contain at least one symbol character.';
    }
    return null;
}

function invalidatePreviousCodes(PDO $pdo, string $email, string $purpose): void
{
    $stmt = $pdo->prepare(
        'UPDATE email_verification_codes SET used_at = NOW()
         WHERE email = ? AND purpose = ? AND used_at IS NULL'
    );
    $stmt->execute([$email, $purpose]);
}

function storeVerificationCode(
    PDO $pdo,
    string $email,
    string $purpose,
    ?array $payload = null,
    ?string $setupToken = null
): string {
    invalidatePreviousCodes($pdo, $email, $purpose);

    $code = generateVerificationCode();
    $expires = (new DateTime('+' . VERIFICATION_CODE_MINUTES . ' minutes'))->format('Y-m-d H:i:s');

    $stmt = $pdo->prepare(
        'INSERT INTO email_verification_codes (email, code, purpose, setup_token, payload, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $email,
        $code,
        $purpose,
        $setupToken,
        $payload !== null ? json_encode($payload) : null,
        $expires,
    ]);

    return $code;
}

function verifyEmailCode(PDO $pdo, string $email, string $code, string $purpose): ?array
{
    $stmt = $pdo->prepare(
        'SELECT * FROM email_verification_codes
         WHERE email = ? AND code = ? AND purpose = ? AND used_at IS NULL AND expires_at > NOW()
         ORDER BY id DESC LIMIT 1'
    );
    $stmt->execute([$email, $code, $purpose]);
    $row = $stmt->fetch();

    if (!$row) {
        return null;
    }

    $pdo->prepare('UPDATE email_verification_codes SET used_at = NOW() WHERE id = ?')
        ->execute([$row['id']]);

    return $row;
}

function verifySetupToken(PDO $pdo, string $setupToken, string $purpose): ?array
{
    $stmt = $pdo->prepare(
        'SELECT * FROM email_verification_codes
         WHERE setup_token = ? AND purpose = ? AND used_at IS NULL AND expires_at > NOW()
         ORDER BY id DESC LIMIT 1'
    );
    $stmt->execute([$setupToken, $purpose]);
    return $stmt->fetch() ?: null;
}

function sendVerificationEmail(string $email, string $code, string $subject, string $bodyIntro): bool
{
    $message = "$bodyIntro\n\nYour verification code is: $code\n\nThis code expires in "
        . VERIFICATION_CODE_MINUTES . " minutes.\n\n— Rovyn";

    $headers = 'From: ' . MAIL_FROM . "\r\n" .
        'Reply-To: ' . MAIL_FROM . "\r\n" .
        'Content-Type: text/plain; charset=UTF-8';

    return @mail($email, $subject, $message, $headers);
}

function dispatchVerificationCode(string $email, string $code, string $purpose): array
{
    $subjects = [
        'registration' => 'Verify your Rovyn account',
        'google_signup' => 'Complete your Rovyn Google sign-up',
        'password_reset' => 'Reset your Rovyn password',
    ];
    $intros = [
        'registration' => 'Thanks for signing up with Rovyn!',
        'google_signup' => 'Complete your account setup after signing in with Google.',
        'password_reset' => 'You requested to reset your Rovyn password.',
    ];

    $sent = sendVerificationEmail(
        $email,
        $code,
        $subjects[$purpose] ?? 'Rovyn verification code',
        $intros[$purpose] ?? 'Your verification code:'
    );

    $result = ['emailSent' => $sent];
    if (APP_DEBUG) {
        $result['devCode'] = $code;
    }
    return $result;
}

function ensureVerificationSchema(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS email_verification_codes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          code VARCHAR(6) NOT NULL,
          purpose ENUM('registration', 'google_signup', 'password_reset') NOT NULL,
          setup_token VARCHAR(128) NULL,
          payload JSON NULL,
          expires_at DATETIME NOT NULL,
          used_at DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email_purpose (email, purpose),
          INDEX idx_setup_token (setup_token)
        ) ENGINE=InnoDB"
    );

    try {
        $pdo->exec('ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0');
    } catch (Throwable) {
        /* column may already exist */
    }
}
