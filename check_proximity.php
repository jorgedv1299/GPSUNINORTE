<?php
// Obtener los parámetros de latitud, longitud y radio desde la solicitud GET
$lat = isset($_GET['lat']) ? $_GET['lat'] : null;
$lng = isset($_GET['lng']) ? $_GET['lng'] : null;
$radius = isset($_GET['radius']) ? $_GET['radius'] : 60; // Radio en metros, valor por defecto 60

// Verificar si los parámetros son válidos
if (!$lat || !$lng) {
    http_response_code(400); // Respuesta HTTP de error
    echo json_encode(['error' => 'Latitud y longitud son requeridas']);
    exit;
}

// Registrar los valores recibidos para depuración
error_log("Latitud: $lat, Longitud: $lng, Radio: $radius"); // Registro en el log del servidor

try {
    // Conectar a la base de datos
    $servername = "dbjmll.c16ww6ag23kz.us-east-2.rds.amazonaws.com";
    $username = "administrador";       
    $password = "condorito1";
    $dbname = "dbjmll";
    
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Manejo de errores

    // Consulta para obtener las ubicaciones dentro del radio, incluyendo velocidad y rpm
    $sql = "
        SELECT 
            id,
            velocidad,
            rpm,
            DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') AS fecha,
            latitude,
            longitude
        FROM ubicaciones
        WHERE 
        (6371000 * acos(cos(radians(:lat)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(:lng)) + 
        sin(radians(:lat)) * sin(radians(latitude)))) <= :radius
        ORDER BY fecha ASC"; // Fórmula de Haversine para cálculo de distancia

    // Preparar y ejecutar la consulta
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':lat', $lat, PDO::PARAM_STR);
    $stmt->bindParam(':lng', $lng, PDO::PARAM_STR);
    $stmt->bindParam(':radius', $radius, PDO::PARAM_INT);
    $stmt->execute();

    // Obtener los resultados y almacenarlos en un array asociativo
    $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Construir la respuesta en JSON
    echo json_encode(['locations' => $locations]);

} catch (PDOException $e) {
    // Manejo de errores en la conexión o consulta
    error_log('Error de conexión o consulta: ' . $e->getMessage());
    echo json_encode(['error' => 'Error al acceder a la base de datos']);
}
?>
