<?php
require_once __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

$user = getAuthenticatedUser();

jsonResponse(['user' => formatUser($user)]);
