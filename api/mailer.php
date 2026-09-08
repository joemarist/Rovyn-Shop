<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config.php';

/**
 * Send an email verification / password reset code.
 *
 * Supported purposes:
 * - registration
 * - google_signup
 * - password_reset
 */
function sendVerificationEmail(
    string $recipientEmail,
    string $recipientName,
    string $code,
    string $purpose = 'registration'
): bool {

    $mail = new PHPMailer(true);

    try {

        /*
         * SMTP CONFIGURATION
         */
        $mail->isSMTP();
        $mail->Host = MAIL_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = MAIL_USERNAME;
        $mail->Password = MAIL_PASSWORD;

        // Gmail SMTP using port 587 + STARTTLS
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = MAIL_PORT;

        /*
         * CHARACTER SET
         */
        $mail->CharSet = 'UTF-8';

        /*
         * SENDER
         */
        $mail->setFrom(
            MAIL_FROM,
            MAIL_FROM_NAME
        );

        /*
         * RECIPIENT
         */
        $mail->addAddress(
            $recipientEmail,
            $recipientName
        );

        /*
         * DETERMINE EMAIL TYPE
         */
        switch ($purpose) {

            case 'password_reset':

                $subject = 'Rovyn Shoppy - Password Reset Code';

                $title = 'Reset Your Password';

                $message =
                    'Use the verification code below to reset your password.';

                break;

            case 'google_signup':

                $subject = 'Rovyn Shoppy - Verify Your Google Account';

                $title = 'Verify Your Email';

                $message =
                    'Use the verification code below to complete your Google account registration.';

                break;

            case 'registration':

                $subject = 'Rovyn Shoppy - Email Verification Code';

                $title = 'Verify Your Email';

                $message =
                    'Use the verification code below to verify your email address.';

                break;

            default:

                // Prevent unsupported purposes from sending an email
                return false;
        }

        /*
         * ESCAPE VALUES USED IN HTML
         */
        $safeName = htmlspecialchars(
            $recipientName,
            ENT_QUOTES,
            'UTF-8'
        );

        $safeCode = htmlspecialchars(
            $code,
            ENT_QUOTES,
            'UTF-8'
        );

        $safeTitle = htmlspecialchars(
            $title,
            ENT_QUOTES,
            'UTF-8'
        );

        $safeMessage = htmlspecialchars(
            $message,
            ENT_QUOTES,
            'UTF-8'
        );

        /*
         * EMAIL SUBJECT
         */
        $mail->Subject = $subject;

        /*
         * HTML EMAIL
         */
        $mail->isHTML(true);

        $mail->Body = "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>{$safeTitle}</title>
        </head>

        <body style='
            margin: 0;
            padding: 30px 15px;
            background-color: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
        '>

            <div style='
                max-width: 500px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #e5e5e5;
                border-radius: 16px;
                padding: 35px;
            '>

                <h1 style='
                    margin: 0 0 10px 0;
                    font-size: 26px;
                    color: #111111;
                '>
                    {$safeTitle}
                </h1>

                <p style='
                    margin: 0 0 20px 0;
                    color: #555555;
                    font-size: 15px;
                    line-height: 1.6;
                '>
                    Hello {$safeName},
                </p>

                <p style='
                    margin: 0 0 25px 0;
                    color: #555555;
                    font-size: 15px;
                    line-height: 1.6;
                '>
                    {$safeMessage}
                </p>

                <!-- Verification Code -->
                <div style='
                    text-align: center;
                    margin: 30px 0;
                '>

                    <div style='
                        display: inline-block;
                        padding: 18px 28px;
                        background-color: #f5f5f5;
                        border: 1px solid #e5e5e5;
                        border-radius: 12px;
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #111111;
                    '>
                        {$safeCode}
                    </div>

                </div>

                <p style='
                    margin: 0 0 15px 0;
                    color: #555555;
                    font-size: 14px;
                    line-height: 1.6;
                '>
                    This verification code will expire in
                    <strong>" . VERIFICATION_CODE_MINUTES . " minutes</strong>.
                </p>

                <p style='
                    margin: 0 0 25px 0;
                    color: #777777;
                    font-size: 13px;
                    line-height: 1.6;
                '>
                    If you did not request this code, you can safely ignore
                    this email.
                </p>

                <hr style='
                    border: 0;
                    border-top: 1px solid #eeeeee;
                    margin: 25px 0;
                '>

                <p style='
                    margin: 0;
                    color: #999999;
                    font-size: 12px;
                    text-align: center;
                '>
                    © " . date('Y') . " Rovyn Shoppy
                </p>

            </div>

        </body>
        </html>
        ";

        /*
         * PLAIN TEXT FALLBACK
         */
        $mail->AltBody =
            "{$title}\n\n" .
            "Hello {$recipientName},\n\n" .
            "{$message}\n\n" .
            "Verification Code: {$code}\n\n" .
            "This code expires in " .
            VERIFICATION_CODE_MINUTES .
            " minutes.\n\n" .
            "If you did not request this code, you can safely ignore this email.";

        /*
         * SEND EMAIL
         */
        $mail->send();

        return true;

    } catch (Exception $e) {

        if (APP_DEBUG) {

            error_log(
                'PHPMailer Error: ' . $mail->ErrorInfo
            );
        }

        return false;
    }
}