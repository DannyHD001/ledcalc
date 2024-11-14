<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$host = 'avteknikk.com';
$db   = 'avteknikk_comledcalc';
$user = 'avteknikk_comledcalc';
$pass = '@CalcLED24';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    // Create table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS panels (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        manufacturer VARCHAR(255) NOT NULL,
        width INT NOT NULL,
        height INT NOT NULL,
        pixelPitch DECIMAL(10,2) NOT NULL,
        weight DECIMAL(10,2) NOT NULL,
        power INT NOT NULL,
        headerConfig JSON NOT NULL,
        controllerOutputCapacity INT NOT NULL,
        flightCaseCapacity INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    $route = $_SERVER['REQUEST_URI'];
    $method = $_SERVER['REQUEST_METHOD'];

    if (strpos($route, '/api/ledcalc/status') !== false) {
        echo json_encode(['status' => 'connected']);
        exit();
    }

    if (strpos($route, '/api/ledcalc/panels') !== false) {
        if ($method === 'GET') {
            $stmt = $pdo->query('SELECT * FROM panels');
            $panels = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $panels]);
        } 
        elseif ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare('INSERT INTO panels (
                id, name, manufacturer, width, height, pixelPitch, weight, power,
                headerConfig, controllerOutputCapacity, flightCaseCapacity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            
            $stmt->execute([
                $data['id'],
                $data['name'],
                $data['manufacturer'],
                $data['width'],
                $data['height'],
                $data['pixelPitch'],
                $data['weight'],
                $data['power'],
                json_encode($data['headerConfig']),
                $data['controllerOutputCapacity'],
                $data['flightCaseCapacity']
            ]);
            
            echo json_encode(['success' => true, 'data' => $data]);
        }
        elseif ($method === 'DELETE') {
            $id = basename($route);
            $stmt = $pdo->prepare('DELETE FROM panels WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}