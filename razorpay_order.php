<?php
require 'razorpay_config.php';
require 'vendor/autoload.php'; // if using Composer

use Razorpay\Api\Api;

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['amount'])) {
    echo json_encode(['success' => false, 'message' => 'Amount required.']);
    exit;
}

$api = new Api(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);

$order = $api->order->create([
    'receipt' => 'order_rcptid_' . rand(1000, 9999),
    'amount' => $data['amount'] * 100, // Razorpay needs in paise
    'currency' => 'INR'
]);

echo json_encode(['success' => true, 'order' => $order]);
