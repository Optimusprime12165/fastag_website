<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['user_id'], $data['items'], $data['total'], $data['method'])) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO orders (user_id, address_id, items, total_price, payment_method, payment_status)
                       VALUES (?, ?, ?, ?, ?, ?)");
$success = $stmt->execute([
    $data['user_id'],
    $data['address_id'] ?? null,
    json_encode($data['items']),
    $data['total'],
    $data['method'],
    $data['method'] === 'cod' ? 'pending' : 'paid'
]);

echo json_encode(['success' => $success]);
