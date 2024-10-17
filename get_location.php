<?php
header('Content-Type: application/json'); // Para que el cliente sepa que está recibiendo JSON

<<<<<<< HEAD
$servername = "disenoelec.c98ge4aae1fw.us-east-1.rds.amazonaws.com"; // Reemplaza con el endpoint de tu RDS si es necesario
$username = "bastod";       // Cambia al usuario de tu base de datos
$password = "bastod0529";           // Cambia a la contraseña de tu base de datos
$dbname = "disenoelec";
=======
// Configuración de la base de datos
$servername = "database-1.cdcwiy8egoqg.us-east-1.rds.amazonaws.com"; // Reemplaza con el endpoint de tu RDS si es necesario
$username = "root";       // Cambia al usuario de tu base de datos
$password = "15963247";           // Cambia a la contraseña de tu base de datos
$dbname = "gps";
>>>>>>> master

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