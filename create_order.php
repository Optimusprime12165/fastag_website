<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit;
}

require 'db.php';
require('razorpay-php/Razorpay.php'); // Use correct path if installed via Composer

use Razorpay\Api\Api;

// ✅ Replace these with your real Razorpay credentials
$keyId = 'YOUR_RAZORPAY_KEY_ID';
$keySecret = 'YOUR_RAZORPAY_KEY_SECRET';

$data = json_decode(file_get_contents("php://input"), true);
$amount = intval($data['amount'] ?? 0) * 100; // in paise
$paymentMethod = $data['payment_method'] ?? '';

if ($amount <= 0 || $paymentMethod !== 'online') {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    exit;
}

try {
    $api = new Api($keyId, $keySecret);

    $order = $api->order->create([
        'receipt' => 'order_rcptid_' . time(),
        'amount' => $amount,
        'currency' => 'INR',
        'payment_capture' => 1
    ]);

    echo json_encode([
        "success" => true,
        "order_id" => $order['id'],
        "amount" => $amount
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Failed to create Razorpay order"]);
}
?>