<?php
header('Content-Type: application/json');
require 'db.php';

// Get raw POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate inputs
if (!isset($data['email'], $data['otp'])) {
    echo json_encode(['success' => false, 'message' => 'Email and OTP are required.']);
    exit;
}

$email = trim($data['email']);
$otp = trim($data['otp']);

try {
    // Fetch user by email
    $stmt = $pdo->prepare("SELECT otp, otp_expiry FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'No user found with this email.']);
        exit;
    }

    $storedOtp = $user['otp'];
    $otpExpiry = strtotime($user['otp_expiry']);
    $currentTime = time();

    if ($storedOtp !== $otp) {
        echo json_encode(['success' => false, 'message' => 'Invalid OTP.']);
    } elseif ($currentTime > $otpExpiry) {
        echo json_encode(['success' => false, 'message' => 'OTP has expired.']);
    } else {
        echo json_encode(['success' => true, 'message' => 'OTP verified successfully.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
