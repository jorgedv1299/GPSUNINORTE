<?php
header('Content-Type: application/json');

<<<<<<< HEAD
<<<<<<< HEAD
=======
// Configuración de la base de datos
>>>>>>> 6e6c71161edc0c52a90150a85bfe963ee10447ad
$servername = "disenoelec.c98ge4aae1fw.us-east-1.rds.amazonaws.com"; // Reemplaza con el endpoint de tu RDS si es necesario
$username = "bastod";       // Cambia al usuario de tu base de datos
$password = "bastod0529";           // Cambia a la contraseña de tu base de datos
$dbname = "disenoelec";
<<<<<<< HEAD
=======
// Configuración de la base de datos
$servername = "alex.cpywocwqwde0.us-east-2.rds.amazonaws.com"; // Reemplaza con el endpoint de tu RDS si es necesario
$username = "alex";       // Cambia al usuario de tu base de datos
$password = "alex1234567890";           // Cambia a la contraseña de tu base de datos
$dbname = "alex";


>>>>>>> master
=======
>>>>>>> 6e6c71161edc0c52a90150a85bfe963ee10447ad

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
$sql = "SELECT latitud, longitud, timestamp FROM ubicaciones WHERE timestamp BETWEEN '$start' AND '$end' ORDER BY timestamp ASC";
$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = [
            'latitud' => $row['latitud'],
            'longitud' => $row['longitud'],
            'timestamp' => $row['timestamp']
        ];
    }
}

// Cerrar la conexión
$conn->close();

// Enviar datos en formato JSON
echo json_encode($data);
?>
