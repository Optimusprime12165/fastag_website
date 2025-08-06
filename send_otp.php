<?php
header('Content-Type: application/json');
require 'db.php';
require 'vendor/autoload.php'; // Make sure PHPMailer is installed via Composer

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Get email from request
$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');

if (!$email) {
    echo json_encode(["success" => false, "message" => "Email is required."]);
    exit;
}

// Check if user exists
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["success" => false, "message" => "No account found with this email."]);
    exit;
}

// Generate OTP and expiry (10 minutes)
$otp = rand(100000, 999999);
$expiry = date("Y-m-d H:i:s", strtotime("+10 minutes"));

// Store OTP in database
$update = $pdo->prepare("UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?");
$update->execute([$otp, $expiry, $email]);

// Send OTP using PHPMailer
$mail = new PHPMailer(true);

try {
    // SMTP settings
    $mail->isSMTP();
    $mail->Host = 'smtp.example.com';         // 🔁 Replace with your SMTP server
    $mail->SMTPAuth = true;
    $mail->Username = 'vishwasbarnwal20@gmail.com';       // 🔁 Replace with your email
    $mail->Password = 'hmajtmzktivudcmm';  // 🔁 Replace with your email password
    $mail->SMTPSecure = 'tls';                // Or 'ssl'
    $mail->Port = 587;                        // Usually 587 for TLS or 465 for SSL

    // Email settings
    $mail->setFrom('vishwasbarnwal20@gmail.com', 'Apna Payment Services');
    $mail->addAddress($email, $user['name']);
    $mail->isHTML(true);
    $mail->Subject = 'Your OTP Code';
    $mail->Body = "<p>Hello <strong>{$user['name']}</strong>,<br><br>Your OTP is <strong>$otp</strong>. It is valid for 10 minutes.</p>";

    $mail->send();

    echo json_encode(["success" => true, "message" => "OTP sent to your email."]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Failed to send OTP. Error: " . $mail->ErrorInfo]);
}
