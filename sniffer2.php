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

// Configuración de la base de datos
$servername = "disenoelec.c98ge4aae1fw.us-east-1.rds.amazonaws.com";
$username = "bastod";       
$password = "bastod0529";
$dbname = "disenoelec";
$port = 3306;

try {
    // Conectar a la base de datos
    $conn = new mysqli($servername, $username, $password, $dbname, $port);

    // Verificar la conexión
    if ($conn->connect_error) {
        throw new Exception("Conexión fallida: " . $conn->connect_error);
    }

    // Crear la tabla si no existe
    $sql = "CREATE TABLE IF NOT EXISTS mediciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        latitud DECIMAL(10, 6) NOT NULL,
        longitud DECIMAL(10, 6) NOT NULL,
        velocidad TEXT NOT NULL,
        rpm TEXT NOT NULL,
        timestamp DATETIME NOT NULL
    )";

    if ($conn->query($sql) !== TRUE) {
        throw new Exception("Error al crear la tabla: " . $conn->error);
    }

    echo "Tabla 'mediciones' verificada o creada exitosamente.\n";
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

    // Console log para mostrar los datos recibidos
    echo "Datos recibidos desde $from:$port - $buf\n";

    // Intentar decodificar los datos JSON
    $data = json_decode($buf, true);

    // Verificar si la decodificación fue exitosa y si los datos contienen latitude, longitude, speed, rpm, y timestamp
    if ($data !== null && isset($data['latitude']) && isset($data['longitude']) && isset($data['speed']) && isset($data['rpm']) && isset($data['timestamp'])) {
        $latitude = $data['latitude'];
        $longitude = $data['longitude'];
        $velocidad = $data['speed'];
        $rpm = $data['rpm'];
        
        // Convertir el timestamp recibido en milisegundos a formato DATETIME de MySQL
        $timestamp = $data['timestamp'] / 1000;
        $datetime = date('Y-m-d H:i:s', $timestamp);

        // Escapar los datos para evitar inyecciones SQL
        $latitude = $conn->real_escape_string($latitude);
        $longitude = $conn->real_escape_string($longitude);
        $velocidad = $conn->real_escape_string($velocidad);
        $rpm = $conn->real_escape_string($rpm);

        // Insertar los datos en la base de datos
        $sql = "INSERT INTO mediciones (latitude, longitude, velocidad, rpm, timestamp) VALUES ('$latitude', '$longitude', '$velocidad', '$rpm', '$datetime')";
        if ($conn->query($sql) !== TRUE) {
            echo "Error al insertar en la base de datos: " . $conn->error . "\n";
        } else {
            echo "Datos guardados en la base de datos - Latitud: $latitude, Longitud: $longitude, Velocidad: $velocidad, RPM: $rpm, Timestamp: $datetime\n";
        }
    } else {
        echo "Formato de datos incorrecto o JSON inválido recibido: $buf\n";
    }
}

// Cerrar el socket cuando termine (en este caso, nunca terminará)
socket_close($sock);

// Cerrar la conexión de la base de datos
$conn->close();
?>