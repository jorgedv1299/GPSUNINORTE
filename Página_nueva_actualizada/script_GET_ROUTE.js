let mapRoute; // Mapa de Google Maps
let markers = []; // Arreglo para almacenar marcadores
let routePolyline = null; // Polilínea global para la ruta

function initMapRoute() {
    // Inicializa el mapa dentro del contenedor
    mapRoute = new google.maps.Map(document.getElementById('map-container'), {
        zoom: 15,
        center: { lat: 11.0190513, lng: -74.8511425 }
    });

    document.getElementById("buscar").addEventListener("click", handleSearch);
}

async function handleSearch() {
    const inicio = document.getElementById("inicio").value;
    const fin = document.getElementById("fin").value;
    const tipoConsulta = document.getElementById("form-selector").value;

    if (!inicio || !fin || !tipoConsulta) {
        alert("Por favor, complete todos los campos antes de continuar.");
        return;
    }

    // Selecciona dinámicamente el archivo PHP según el vehículo
    let endpoints = [];
    if (tipoConsulta === "Vehículo 1") {
        endpoints = ["get_route.php"]; // Vehículo 1 usa get_route.php
    } else if (tipoConsulta === "Vehículo 2") {
        endpoints = ["get_route2.php"]; // Vehículo 2 usa get_route2.php
    } else if (tipoConsulta === "Ambos") {
        endpoints = ["get_route.php", "get_route2.php"]; // Ambos vehículos
    } else {
        alert("Por favor, seleccione un vehículo válido.");
        return;
    }

    try {
        clearMap(); // Limpiar el mapa antes de la nueva consulta

        let allData = []; // Aquí almacenaremos los datos de ambas consultas
        let alertMessage = ""; // Mensaje de alerta si no hay datos

        // Hacemos las consultas a los endpoints seleccionados
        for (const endpoint of endpoints) {
            console.log(`Consultando el endpoint: ${endpoint}`); // Log para depuración

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inicio, fin }),
            });

            if (!response.ok) {
                throw new Error(`Error al obtener los datos del servidor desde ${endpoint}`);
            }

            const data = await response.json();

            console.log(`Datos recibidos de ${endpoint}:`, data); // Log para ver la respuesta

            // Si no hay datos para esta consulta y se seleccionó "Ambos", agregamos un mensaje
            if (data.length === 0) {
                alertMessage += `${endpoint === "get_route.php" ? "Vehículo 1" : "Vehículo 2"} no tiene datos.\n`;
                continue; // Saltamos este endpoint si no hay datos
            }

            // Si hay datos, los agregamos a allData
            allData.push({ endpoint, data });
        }

        // Si se ha acumulado algún mensaje de alerta, lo mostramos
        if (alertMessage !== "") {
            alert(alertMessage);
        }

        // Si tenemos datos en allData, procedemos a graficar las rutas
        if (allData.length > 0) {
            let bounds = new google.maps.LatLngBounds(); // Para ajustar el mapa a la ruta

            allData.forEach(({ endpoint, data }) => {
                const routeCoordinates = data.map((point) => {
                    return { lat: parseFloat(point.lat), lng: parseFloat(point.lng) };
                });

                // Dibuja la polilínea de la ruta
                routePolyline = new google.maps.Polyline({
                    path: routeCoordinates,
                    geodesic: true,
                    strokeColor: endpoint === "get_route.php" ? "#FF0000" : "#0000FF", // Color diferente para cada vehículo
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                });

                routePolyline.setMap(mapRoute);

                // Extender los límites del mapa para que incluya todos los puntos de la ruta
                routeCoordinates.forEach(function(coord) {
                    bounds.extend(coord);
                });
            });

            // Ajustar el mapa para mostrar todos los puntos de la ruta
            mapRoute.fitBounds(bounds);
        } else {
            alert("No se encontraron datos para los vehículos seleccionados.");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al procesar la solicitud.");
    }
}

// Función para limpiar el mapa
function clearMap() {
    // Elimina la polilínea existente
    if (routePolyline) {
        routePolyline.setMap(null);
        routePolyline = null;
    }

    // Limpia los marcadores (si hubiera, aunque en tu caso no los estás usando actualmente)
    markers.forEach((marker) => marker.setMap(null));
    markers = [];
}
