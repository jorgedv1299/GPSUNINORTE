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
    $host = 'database-1.cdcwiy8egoqg.us-east-1.rds.amazonaws.com';
    $db = 'gps';
    $user = 'root';
    $pass = '15963247';
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

    // Obtener los IDs de las ubicaciones para la segunda consulta
    $ids = [];
    foreach ($locations as $location) {
        $ids[] = $location['fecha'];
    }

    // Obtener 20 datos antes y después de cada ubicación dentro del radio
    $proximityData = [];
    foreach ($ids as $fecha) {
        // Consultas anteriores y posteriores
        $currentDataSql = "SELECT latitud, longitud, timestamp FROM ubicaciones WHERE DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') = :fecha";
        $beforeSql = "SELECT latitud, longitud, timestamp FROM ubicaciones WHERE timestamp < :fecha ORDER BY timestamp DESC LIMIT 4";
        $afterSql = "SELECT latitud, longitud, timestamp FROM ubicaciones WHERE timestamp > :fecha ORDER BY timestamp ASC LIMIT 4";

        // Consultar datos
        $currentStmt = $pdo->prepare($currentDataSql);
        $currentStmt->bindParam(':fecha', $fecha);
        $currentStmt->execute();
        $proximityData['current'][$fecha] = $currentStmt->fetchAll(PDO::FETCH_ASSOC);

        $beforeStmt = $pdo->prepare($beforeSql);
        $beforeStmt->bindParam(':fecha', $fecha);
        $beforeStmt->execute();
        $proximityData['before'][$fecha] = $beforeStmt->fetchAll(PDO::FETCH_ASSOC);

        $afterStmt = $pdo->prepare($afterSql);
        $afterStmt->bindParam(':fecha', $fecha);
        $afterStmt->execute();
        $proximityData['after'][$fecha] = $afterStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(['locations' => $locations, 'proximityData' => $proximityData]);

} catch (PDOException $e) {
    echo json_encode(['error' => 'Error al acceder a la base de datos']);
}
