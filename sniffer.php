<?php
// Configuración del servidor UDP
$ip = '0.0.0.0';  // Escucha en todas las interfaces

$port = 6100;     // Puerto al que llega el mensaje UDP




// Crear el socket
$sock = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
if (!$sock) {
    die("No se pudo crear el socket: " . socket_strerror(socket_last_error()) . "\n");
}

// Asociar el socket a la IP y puerto especificados
if (!socket_bind($sock, $ip, $port)) {
    die("No se pudo asociar el socket: " . socket_strerror(socket_last_error()) . "\n");
}

// Ajusta Zona Horaria
date_default_timezone_set('America/Bogota'); 
echo "Escuchando en $ip:$port...\n";


$servername = "alex.cpywocwqwde0.us-east-2.rds.amazonaws.com"; // Reemplaza con el endpoint de tu RDS si es necesario
$username = "alex";       // Cambia al usuario de tu base de datos
$password = "alex1234567890";           // Cambia a la contraseña de tu base de datos
$dbname = "alex";


$port = 3306;
try {
    // Conectar a la base de datos
    $conn = new mysqli($servername, $username, $password, $dbname, $port);

    // Verificar la conexión
    if ($conn->connect_error) {
        throw new Exception("Conexión fallida: " . $conn->connect_error);
    }

    // Crear la tabla si no existe
    $sql = "CREATE TABLE IF NOT EXISTS ubicaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        latitud TEXT NOT NULL,
        longitud TEXT NOT NULL,
        timestamp DATETIME NOT NULL
    )";

    if ($conn->query($sql) !== TRUE) {
        throw new Exception("Error al crear la tabla: " . $conn->error);
    }

    echo "Tabla 'ubicaciones' verificada o creada exitosamente.\n";
} catch (Exception $e) {
    die($e->getMessage());
}

// Bucle infinito para escuchar y procesar los datos recibidos
while (true) {
    $buf = '';
    $from = '';
    $port = 0;
    
    // Recibir datos (máximo 512 bytes)
    socket_recvfrom($sock, $buf, 512, 0, $from, $port);

    echo "Datos recibidos: $buf\n";

    // Procesar los datos recibidos (ejemplo: dividir por comas si viene en CSV)
    $data = explode(',', $buf);

    // Depuración: mostrar los datos divididos
    echo "Datos divididos: " . print_r($data, true) . "\n";

    if (count($data) === 3) {
        list($latitud, $longitud, $timestamp) = $data;

        // Validar que los datos sean números válidos
        if (is_numeric($latitud) && is_numeric($longitud) && is_numeric($timestamp)) {
            // Convertir timestamp a formato DATETIME
            $datetime = date('Y-m-d H:i:s', $timestamp / 1000); // Convertir milisegundos a segundos

            // Escapar los datos para evitar inyecciones SQL
            $latitud = $conn->real_escape_string($latitud);
            $longitud = $conn->real_escape_string($longitud);
            $datetime = $conn->real_escape_string($datetime);

            // Insertar los datos en la base de datos
            $sql = "INSERT INTO ubicaciones (latitud, longitud, timestamp) VALUES ('$latitud', '$longitud', '$datetime')";
            if ($conn->query($sql) !== TRUE) {
                echo "Error: " . $sql . "\n" . $conn->error;
            } else {
                echo "Datos guardados en la base de datos\n";
            }
        } else {
            echo "Datos inválidos: Latitud: $latitud, Longitud: $longitud, Timestamp: $timestamp\n";
        }
    } else {
        echo "Formato de datos incorrecto\n";
    }
}

// Cerrar el socket cuando termine (en este caso, nunca terminará)
socket_close($sock);

// Cerrar la conexión de la base de datos
$conn->close();
?>


