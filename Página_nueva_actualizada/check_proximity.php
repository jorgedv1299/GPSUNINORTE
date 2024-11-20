<?php
header('Content-Type: application/json');

$servername = "alex.cpywocwqwde0.us-east-2.rds.amazonaws.com";
$username = "alex";
$password = "alex1234567890";
$dbname = "alex";
$port_db = 3306;

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}

$lat = $_GET['lat'];
$lng = $_GET['lng'];
$radius = $_GET['radius'];
$start = $_GET['start'];
$end = $_GET['end'];

// Conversión de radio a grados (1 grado ~ 111 km)
$radiusInDegrees = $radius / 111000;

// Query para buscar rutas cercanas en el rango de tiempo
$sql = "SELECT latitude, longitude, timestamp,
        (6371 * acos(
            cos(radians(?)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(latitude))
        )) AS distance
        FROM mediciones
        WHERE timestamp BETWEEN ? AND ?
        HAVING distance <= ?
        ORDER BY timestamp ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ddddss", $lat, $lng, $lat, $start, $end, $radiusInDegrees);
$stmt->execute();

$result = $stmt->get_result();
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        "latitud" => $row['latitude'],
        "longitud" => $row['longitude'],
        "timestamp" => $row['timestamp']
    ];
}

$conn->close();
echo json_encode($data);
?>
