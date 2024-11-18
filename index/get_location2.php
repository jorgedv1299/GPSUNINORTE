<?php
header('Content-Type: application/json'); // Para que el cliente sepa que está recibiendo JSON

$servername = "database-1.cdcwiy8egoqg.us-east-1.rds.amazonaws.com"; // Reemplaza con el endpoint de tu RDS si es necesario
$username = "root";       // Cambia al usuario de tu base de datos
$password = "15963247";           // Cambia a la contraseña de tu base de datos
$dbname = "gps";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}


// Obtener la última ubicación
$sql = "SELECT latitude, longitude, timestamp FROM mediciones2 ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    // Obtener los datos de la última ubicación
    $row = $result->fetch_assoc();
    
    // La fecha ya está en el formato correcto
    $formattedDate = $row['timestamp'];
    
    $data = [
        'latitud' => $row['latitude'],
        'longitud' => $row['longitude'],
        'timestamp' => $formattedDate // Utilizar directamente el timestamp formateado
    ];
}

// Cerrar la conexión
$conn->close();

// Enviar datos en formato JSON
echo json_encode($data);
?>