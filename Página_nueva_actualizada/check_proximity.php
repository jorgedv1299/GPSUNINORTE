<?php
header('Content-Type: application/json'); // Para devolver un JSON

$servername = "alex.cpywocwqwde0.us-east-2.rds.amazonaws.com";
$username = "alex";
$password = "alex1234567890";
$dbname = "alex";
$port_db = 3306;

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Obtener parámetros del front
$start = $_GET['start'];
$end = $_GET['end'];
$latitude = $_GET['latitude'];
$longitude = $_GET['longitude'];
$radius = $_GET['radius']; // Radio en kilómetros

// Fórmula de Haversine en MySQL
$sql = "SELECT latitude, longitude, timestamp, 
        (6371 * ACOS(COS(RADIANS($latitude)) * COS(RADIANS(latitude)) 
        * COS(RADIANS(longitude) - RADIANS($longitude)) 
        + SIN(RADIANS($latitude)) * SIN(RADIANS(latitude)))) AS distance 
        FROM mediciones 
        WHERE timestamp BETWEEN '$start' AND '$end' 
        HAVING distance <= $radius 
        ORDER BY timestamp ASC";

$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'latitud' => $row['latitude'],
            'longitud' => $row['longitude'],
            'timestamp' => $row['timestamp'],
            'distance' => $row['distance']
        ];
    }
}

// Cerrar la conexión
$conn->close();

// Enviar los datos como JSON
echo json_encode($data);
?>
