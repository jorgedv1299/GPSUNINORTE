<?php
header('Content-Type: application/json');

$servername = "alex.cpywocwqwde0.us-east-2.rds.amazonaws.com";
$username = "alex";       
$password = "alex1234567890";
$dbname = "alex";


// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Obtener fechas desde la solicitud
$start = $_GET['start'];
$end = $_GET['end'];

// Consultar todas las ubicaciones entre las fechas seleccionadas de la primera tabla
$sql1 = "SELECT latitude, longitude, timestamp FROM mediciones WHERE timestamp BETWEEN '$start' AND '$end' ORDER BY timestamp ASC";
$result1 = $conn->query($sql1);

$data = [];
if ($result1->num_rows > 0) {
    while ($row = $result1->fetch_assoc()) {
        $data[] = [
            'latitud' => $row['latitude'],
            'longitud' => $row['longitude'],
            'timestamp' => $row['timestamp']
        ];
    }
}

// Consultar todas las ubicaciones entre las fechas seleccionadas de la segunda tabla
$sql2 = "SELECT latitude, longitude, timestamp FROM mediciones2 WHERE timestamp BETWEEN '$start' AND '$end' ORDER BY timestamp ASC";
$result2 = $conn->query($sql2);

if ($result2->num_rows > 0) {
    while ($row = $result2->fetch_assoc()) {
        $data[] = [
            'latitud' => $row['latitude'],
            'longitud' => $row['longitude'],
            'timestamp' => $row['timestamp']
        ];
    }
}

// Cerrar la conexión
$conn->close();

// Enviar datos en formato JSON
echo json_encode($data);
?>
