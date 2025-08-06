<?php
header('Content-Type: application/json');
require 'db.php';

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['email'])) {
    echo json_encode(["success" => false, "message" => "Email is required."]);
    exit;
}

$email = trim($data['email']);
$password = $data['password'] ?? null;
$loginType = $data['login_type'] ?? 'manual';

// Fetch user by email
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found. Please sign up."]);
    exit;
}

// Handle login types
if ($loginType === 'manual') {
    if (!$password) {
        echo json_encode(["success" => false, "message" => "Password is required."]);
        exit;
    }

    // Check password hash
    if (!password_verify($password, $user['password'])) {
        echo json_encode(["success" => false, "message" => "Incorrect password."]);
        exit;
    }

} elseif ($loginType === 'google') {
    if ($user['login_type'] !== 'google') {
        echo json_encode(["success" => false, "message" => "Please use manual login."]);
        exit;
    }

} else {
    echo json_encode(["success" => false, "message" => "Invalid login type."]);
    exit;
}

// Login successful
echo json_encode([
    "success" => true,
    "message" => "Login successful.",
    "user" => [
        "id" => $user['id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "login_type" => $user['login_type']
    ]
]);
