<?php
// Database configuration for XAMPP MySQL
define('DB_HOST', 'localhost');
define('DB_NAME', 'rovyn_db');
define('DB_USER', 'root');
define('DB_PASS', '');

define(
    'GOOGLE_CLIENT_ID',
    getenv('GOOGLE_CLIENT_ID') ?: '683085655451-o2rlo2us983qfhbhtka4pcffrd1uv20v.apps.googleusercontent.com'
);

define('APP_BASE_URL', getenv('APP_BASE_URL') ?: 'http://localhost:8443');

define('AUTH_TOKEN_DAYS', 7);
define('RESET_TOKEN_HOURS', 1);
define('VERIFICATION_CODE_MINUTES', 15);

// Debug
define(
    'APP_DEBUG',
    filter_var(
        getenv('APP_DEBUG') ?: 'true',
        FILTER_VALIDATE_BOOLEAN
    )
);

// Email
define(
    'MAIL_FROM',
    getenv('MAIL_FROM') ?: 'rovynshoppy@gmail.com'
);

define(
    'MAIL_FROM_NAME',
    getenv('MAIL_FROM_NAME') ?: 'Rovyn Shoppy'
);

define(
    'MAIL_USERNAME',
    getenv('MAIL_USERNAME') ?: 'rovynshoppy@gmail.com'
);

define(
    'MAIL_PASSWORD',
    getenv('MAIL_PASSWORD') ?: 'fybl nlye rfud akmf'
);

define(
    'MAIL_HOST',
    getenv('MAIL_HOST') ?: 'smtp.gmail.com'
);

define(
    'MAIL_PORT',
    getenv('MAIL_PORT') ?: 587
);