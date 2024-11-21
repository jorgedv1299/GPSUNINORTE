<?php
header('Content-Type: application/json');

<<<<<<< HEAD
$servername = "dbjmll.c16ww6ag23kz.us-east-2.rds.amazonaws.com";
$username = "administrador";       
$password = "condorito1";
$dbname = "dbjmll";
=======
// Configuración de la base de datos

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
// Obtener fechas desde la solicitud
$start = $_GET['start'];
$end = $_GET['end'];

// Consultar todas las ubicaciones entre las fechas seleccionadas
$sql = "SELECT latitude, longitude, timestamp FROM mediciones WHERE timestamp BETWEEN '$start' AND '$end' ORDER BY timestamp ASC";
$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
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