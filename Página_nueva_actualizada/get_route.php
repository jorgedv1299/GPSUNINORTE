<?php
header('Content-Type: application/json');

$servername = "dbjmll.c16ww6ag23kz.us-east-2.rds.amazonaws.com";
$username = "administrador";       
$password = "condorito1";
$dbname = "dbjmll";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}

// Leer los datos enviados por el cliente
$input = json_decode(file_get_contents("php://input"), true);

$start = $input['inicio'] ?? null;
$end = $input['fin'] ?? null;

// Validar las entradas
if (!$start || !$end) {
    echo json_encode(["error" => "Faltan parámetros de inicio o fin."]);
    $conn->close();
    exit;
}

$data = [];

// Consultar ubicaciones de la tabla `mediciones2`
$sql2 = "SELECT latitude, longitude, timestamp FROM mediciones WHERE timestamp BETWEEN '$start' AND '$end' ORDER BY timestamp ASC";
$result2 = $conn->query($sql2);

if ($result2 && $result2->num_rows > 0) {
    while ($row = $result2->fetch_assoc()) {
        $data[] = [
            'lat' => $row['latitude'],
            'lng' => $row['longitude'],
            'timestamp' => $row['timestamp']
        ];
    }
}

// Cerrar la conexión
$conn->close();

// Enviar datos en formato JSON
echo json_encode($data);
