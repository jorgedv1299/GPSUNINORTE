<?php
// Configuración del servidor UDP
$ip = '0.0.0.0';
$port = 6100;

// Crear el socket
$sock = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
if (!$sock) {
    die("No se pudo crear el socket: " . socket_strerror(socket_last_error()) . "\n");
}

// Asociar el socket a la IP y puerto especificados
if (!socket_bind($sock, $ip, $port)) {
    die("No se pudo asociar el socket: " . socket_strerror(socket_last_error()) . "\n");
}

date_default_timezone_set('America/Bogota');
echo "Escuchando en $ip:$port...\n";

// Configuración de la base de datos
$servername = "alex.cpywocwqwde0.us-east-2.rds.amazonaws.com";
$username = "alex";
$password = "alex1234567890";
$dbname = "alex";
$port_db = 3306;

try {
    $conn = new mysqli($servername, $username, $password, $dbname, $port_db);
    if ($conn->connect_error) {
        throw new Exception("Conexión fallida: " . $conn->connect_error);
    }

    // Crear la tabla con columnas para latitud y longitud si no existe
    $sql = "CREATE TABLE IF NOT EXISTS mediciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        velocidad TEXT NOT NULL,
        rpm TEXT NOT NULL,
        latitude DECIMAL(10, 6) NOT NULL,
        longitude DECIMAL(10, 6) NOT NULL,
        timestamp DATETIME NOT NULL
    )";

    if ($conn->query($sql) !== TRUE) {
        throw new Exception("Error al crear la tabla: " . $conn->error);
    }

    echo "Tabla 'mediciones' verificada o creada exitosamente.\n";
} catch (Exception $e) {
    die($e->getMessage());
}

while (true) {
    $buf = '';
    $from = '';
    $port = 0;

    socket_recvfrom($sock, $buf, 512, 0, $from, $port);
    echo "Datos recibidos desde $from:$port - $buf\n";

    // Intentar decodificar como JSON
    $data = json_decode($buf, true);

    if ($data !== null && isset($data['speed'], $data['rpm'], $data['timestamp'], $data['latitude'], $data['longitude'])) {
        $velocidad = $data['speed'];
        $rpm = $data['rpm'];
        $latitude = $data['latitude'];
        $longitude = $data['longitude'];
        $timestamp = $data['timestamp'] / 1000;
        $datetime = date('Y-m-d H:i:s', $timestamp);
    } else {
        echo "Formato de datos incorrecto recibido: $buf\n";
        continue;
    }

    // Escapar los datos para prevenir inyecciones SQL
    $velocidad = $conn->real_escape_string($velocidad);
    $rpm = $conn->real_escape_string($rpm);
    $latitude = $conn->real_escape_string($latitude);
    $longitude = $conn->real_escape_string($longitude);

    // Insertar los datos en la base de datos
    $sql = "INSERT INTO mediciones (velocidad, rpm, latitude, longitude, timestamp) VALUES ('$velocidad', '$rpm', '$latitude', '$longitude', '$datetime')";
    if ($conn->query($sql) !== TRUE) {
        echo "Error al insertar en la base de datos: " . $conn->error . "\n";
    } else {
        echo "Datos guardados en la base de datos - Velocidad: $velocidad, RPM: $rpm, Latitude: $latitude, Longitude: $longitude, Timestamp: $datetime\n";
    }
    sleep(10);
}

socket_close($sock);
$conn->close();
?>
