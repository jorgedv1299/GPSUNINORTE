<?php
header('Content-Type: application/json');

// Obtener los parámetros enviados desde la solicitud
$input = json_decode(file_get_contents("php://input"), true);
$lat = $input['lat'] ?? null;
$lng = $input['lng'] ?? null;
$radius = $input['radio'] ?? 0;
$start = $input['inicio'] ?? null;
$end = $input['fin'] ?? null;

if (!$lat || !$lng || !$radius || !$start || !$end) {
    echo json_encode(['error' => 'Faltan parámetros.']);
    exit;
}

// Conexión a la base de datos
$servername = "database-1.cdcwiy8egoqg.us-east-1.rds.amazonaws.com"; // Reemplaza con el endpoint de tu RDS si es necesario
$username = "root";       // Cambia al usuario de tu base de datos
$password = "15963247";           // Cambia a la contraseña de tu base de datos
$dbname = "gps";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['error' => "Error de conexión: " . $conn->connect_error]);
    exit;
}

// Consulta para obtener los puntos dentro del radio y el intervalo de tiempo
$sql = "
    SELECT latitude, longitude, velocidad, rpm, timestamp 
    FROM mediciones2
    WHERE 
    (6371000 * acos(cos(radians($lat)) * cos(radians(latitude)) * 
    cos(radians(longitude) - radians($lng)) + 
    sin(radians($lat)) * sin(radians(latitude)))) <= $radius
    AND timestamp BETWEEN '$start' AND '$end'
";

$result = $conn->query($sql);

$data = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

$conn->close();
echo json_encode($data);
?>
