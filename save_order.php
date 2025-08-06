<?php
require 'db.php'; // your PDO database connection
session_start();

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

// Basic validation
if (!isset($data['user_id']) || !isset($data['address_id']) || !isset($data['payment_method']) || !isset($data['amount'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$user_id = $data['user_id'];
$address_id = $data['address_id'];
$payment_method = $data['payment_method']; // "razorpay" or "cod"
$amount = $data['amount'];
$razorpay_payment_id = $data['razorpay_payment_id'] ?? null;

try {
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, address_id, payment_method, amount, razorpay_payment_id) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$user_id, $address_id, $payment_method, $amount, $razorpay_payment_id]);

    echo json_encode(["success" => true, "message" => "Order saved successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>