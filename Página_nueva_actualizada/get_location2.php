<?php
header('Content-Type: application/json'); // Para que el cliente sepa que está recibiendo JSON

<<<<<<< HEAD
$servername = "dbjmll.c16ww6ag23kz.us-east-2.rds.amazonaws.com";
$username = "administrador";       
$password = "condorito1";
$dbname = "dbjmll";
=======
$servername = "alex.cpywocwqwde0.us-east-2.rds.amazonaws.com"; // Reemplaza con el endpoint de tu RDS si es necesario
$username = "alex";       // Cambia al usuario de tu base de datos
$password = "alex1234567890";           // Cambia a la contraseña de tu base de datos
$dbname = "alex";
>>>>>>> 0b0d6520e5e514e4f1fca773678b61ec3e872806

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}


// Obtener la última ubicación
$sql = "SELECT latitude, longitude, velocidad, rpm,  timestamp FROM mediciones2 ORDER BY id DESC LIMIT 1";
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
        'speed' => (float)$row['velocidad'], 
        'rpm' => (int)$row['rpm'],
        'timestamp' => $formattedDate // Utilizar directamente el timestamp formateado
    ];
}

// Cerrar la conexión
$conn->close();

// Enviar datos en formato JSON
echo json_encode($data);
?>