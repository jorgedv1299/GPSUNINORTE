<?php
// Obtener los parámetros de latitud y longitud desde la solicitud GET
$lat = isset($_GET['lat']) ? $_GET['lat'] : null;
$lng = isset($_GET['lng']) ? $_GET['lng'] : null;
$radius = 40; // Radio en metros

// Verificar si los parámetros son válidos
if (!$lat || !$lng) {
    http_response_code(400); // Respuesta HTTP de error
    echo json_encode(['error' => 'Latitud y longitud son requeridas']);
    exit;
}

// Registrar los valores recibidos para depuración
error_log("Latitud: $lat, Longitud: $lng"); // Registro en el log del servidor

try {
    // Conectar a la base de datos
    $host = 'alex.cpywocwqwde0.us-east-2.rds.amazonaws.com';
    $db = 'alex';
    $user = 'alex';
    $pass = 'alex1234567890';
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Manejo de errores

    // Consulta para obtener las ubicaciones dentro del radio
    $sql = "
        SELECT 
            DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') as fecha, 
            latitud, 
            longitud,
            COUNT(DISTINCT id) as cantidad
        FROM ubicaciones
        WHERE 
        (6371000 * acos(cos(radians(:lat)) * cos(radians(latitud)) * 
        cos(radians(longitud) - radians(:lng)) + 
        sin(radians(:lat)) * sin(radians(latitud)))) <= :radius
        GROUP BY fecha, latitud, longitud
        ORDER BY fecha ASC"; //formula de haaverside

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':lat', $lat, PDO::PARAM_STR);
    $stmt->bindParam(':lng', $lng, PDO::PARAM_STR);
    $stmt->bindParam(':radius', $radius, PDO::PARAM_INT);
    $stmt->execute();

    // Obtener los resultados
    $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolver los resultados en formato JSON
    echo json_encode($locations);

} catch (PDOException $e) {
    // Manejar errores en la conexión o consulta
    http_response_code(500); // Error del servidor
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $e->getMessage()]);
}
?>
 