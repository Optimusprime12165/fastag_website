<?php
header('Content-Type: application/json');
require 'db.php';

// Get input from JSON
$data = json_decode(file_get_contents("php://input"), true);

// Check required fields
if (!isset($data['email'], $data['new_password'])) {
    echo json_encode(['success' => false, 'message' => 'Email and new password are required.']);
    exit;
}

$email = trim($data['email']);
$newPassword = $data['new_password'];

// Validate password (optional - add your own checks)
if (strlen($newPassword) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit;
}

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'No account found with that email.']);
        exit;
    }

    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    // Update password in the database
    $update = $pdo->prepare("UPDATE users SET password = ?, otp = NULL, otp_expiry = NULL WHERE email = ?");
    $update->execute([$hashedPassword, $email]);

    echo json_encode(['success' => true, 'message' => 'Password has been successfully updated.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
