<?php
header('Content-Type: application/json'); // Para que el cliente sepa que está recibiendo JSON

$servername = "disenoelec.c98ge4aae1fw.us-east-1.rds.amazonaws.com";
$username = "disenoelec";       
$password = "bastod";
$dbname = "bastod0529";



// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}


// Obtener la última ubicación
$sql = "SELECT latitud, longitud, timestamp FROM ubicaciones ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    // Obtener los datos de la última ubicación
    $row = $result->fetch_assoc();
    
    // La fecha ya está en el formato correcto
    $formattedDate = $row['timestamp'];
    
    $data = [
        'latitud' => $row['latitud'],
        'longitud' => $row['longitud'],
        'timestamp' => $formattedDate // Utilizar directamente el timestamp formateado
    ];
}

// Cerrar la conexión
$conn->close();

// Enviar datos en formato JSON
echo json_encode($data);
?>