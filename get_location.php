<?php
header('Content-Type: application/json'); // Para que el cliente sepa que está recibiendo JSON

<<<<<<< HEAD
// Configuración de la base de datos
$servername = "alex.cpywocwqwde0.us-east-2.rds.amazonaws.com"; // Reemplaza con el endpoint de tu RDS si es necesario
$username = "alex";       // Cambia al usuario de tu base de datos
$password = "alex1234567890";           // Cambia a la contraseña de tu base de datos
$dbname = "alex";
=======
$servername = "disenoelec.c98ge4aae1fw.us-east-1.rds.amazonaws.com";
$username = "disenoelec";       
$password = "bastod";
$dbname = "bastod0529";


>>>>>>> 1d420002a4063787de261193bcf7317d0b87daa2

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}


// Obtener la última ubicación
$sql = "SELECT latitude, longitude, timestamp FROM mediciones ORDER BY id DESC LIMIT 1";
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