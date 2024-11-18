<?php
header('Content-Type: application/json'); // Para que el cliente sepa que está recibiendo JSON

$servername = "database-1.cxg86oymix3m.us-east-1.rds.amazonaws.com";
$username = "bastod";
$password = "bastod0529";
$dbname = "disenoelec";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Obtener la última velocidad y RPM
$sql = "SELECT velocidad, rpm FROM mediciones ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    // Obtener los datos de la última medición
    $row = $result->fetch_assoc();
    
    $data = [
        'speed' => (float)$row['velocidad'], // Convertir a float si es necesario
        'rpm' => (int)$row['rpm'] // Convertir a int si es necesario
    ];
}

// Cerrar la conexión
$conn->close();

// Enviar datos en formato JSON
echo json_encode($data);
?>
