let mapRoute; // Mapa de Google Maps
let markers = [];
let routePolylines = [];
let autocomplete;
let ubicacionContainerVisible = false; // Estado inicial del subcontenedor
let searchCircles = []; // Arreglo para manejar múltiples círculos

function initMapRoute() {
    mapRoute = new google.maps.Map(document.getElementById('map-container'), {
        zoom: 15,
        center: { lat: 11.0190513, lng: -74.8511425 }
    });

    autocomplete = new google.maps.places.Autocomplete(document.getElementById('ubicacion'));
    autocomplete.bindTo('bounds', mapRoute);

    document.getElementById("buscar").addEventListener("click", handleSearch);
    document.getElementById("buscar-ubicacion").addEventListener("click", handleLocationSearch);
}

function toggleUbicacionContainer() {
    const container = document.getElementById("ubicacion-container");
    const toggleButton = document.getElementById("toggle-ubicacion");

    if (ubicacionContainerVisible) {
        container.style.display = "none";
        toggleButton.innerText = "Activar Búsqueda por Ubicación";
    } else {
        container.style.display = "block";
        toggleButton.innerText = "Desactivar Búsqueda por Ubicación";
    }

    ubicacionContainerVisible = !ubicacionContainerVisible; // Cambiar el estado
}

async function handleSearch() {
    const inicio = document.getElementById("inicio").value;
    const fin = document.getElementById("fin").value;
    const tipoConsulta = document.getElementById("form-selector").value;

    if (!inicio || !fin || !tipoConsulta) {
        alert("Por favor, complete todos los campos antes de continuar.");
        return;
    }

    let endpoints = [];
    if (tipoConsulta === "Vehículo 1") {
        endpoints = ["get_route.php"];
    } else if (tipoConsulta === "Vehículo 2") {
        endpoints = ["get_route2.php"];
    } else if (tipoConsulta === "Ambos") {
        endpoints = ["get_route.php", "get_route2.php"];
    }

    try {
        clearMap();
        let allData = [];
        for (const endpoint of endpoints) {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inicio, fin }),
            });
            const data = await response.json();
            allData.push({ endpoint, data });
        }

        if (allData.every(({ data }) => data.length === 0)) {
            displayMessage("No se encontró información para la consulta.");
            return;
        } else {
            clearMessage(); // Limpiar cualquier mensaje previo si hay datos
        }

        let bounds = new google.maps.LatLngBounds();
        allData.forEach(({ endpoint, data }) => {
            const routeCoordinates = data.map(point => ({ lat: parseFloat(point.lat), lng: parseFloat(point.lng) }));
            const newPolyline = new google.maps.Polyline({
                ...getPolylineOptions(endpoint),
                path: routeCoordinates,
            });

            routePolylines.push(newPolyline);
            newPolyline.setMap(mapRoute);
            routeCoordinates.forEach(coord => bounds.extend(coord));
        });

        mapRoute.fitBounds(bounds);

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al procesar la solicitud.");
    }
}

<<<<<<< HEAD
// Función para inicializar el mapa
function initMapRealTime() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 4.711, lng: -74.0721 }, // Coordenadas de ejemplo (Bogotá)
        zoom: 12,
    });

    // Agregar marcador de ejemplo
    new google.maps.Marker({
        position: { lat: 4.711, lng: -74.0721 },
        map: map,
        title: "Ubicación Inicial",
    });
} 
=======
async function handleLocationSearch() {
    const place = autocomplete.getPlace();
    const radio = document.getElementById('radio').value;
    const inicio = document.getElementById("inicio").value;
    const fin = document.getElementById("fin").value;
    const tipoConsulta = document.getElementById("form-selector").value;

    if (!place || !radio || !inicio || !fin || !tipoConsulta) {
        alert("Por favor, complete todos los campos antes de continuar.");
        return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    let endpoints = [];
    if (tipoConsulta === "Vehículo 1") {
        endpoints = ["check_proximity.php"];
    } else if (tipoConsulta === "Vehículo 2") {
        endpoints = ["check_proximity2.php"];
    } else if (tipoConsulta === "Ambos") {
        endpoints = ["check_proximity.php", "check_proximity2.php"];
    }

    try {
        clearMap();

        let bounds = new google.maps.LatLngBounds();
        let circleColors = ["#FF0000", "#0000FF"]; // Rojo para Vehículo 1, Azul para Vehículo 2

        for (let i = 0; i < endpoints.length; i++) {
            const endpoint = endpoints[i];
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng, radio, inicio, fin }),
            });

            const data = await response.json();

            if (data.length === 0) {
                displayMessage(`No se encontró información para ${endpoint === "check_proximity.php" ? "Vehículo 1" : "Vehículo 2"} en el radio seleccionado.`);
                continue;
            } else {
                clearMessage(); // Limpiar cualquier mensaje previo si hay datos
            }

            // Dibujar el círculo de búsqueda para este vehículo
            drawSearchCircle(lat, lng, radio, circleColors[i]);

            const polylineOptions = getPolylineOptions(endpoint);

            // Dibujar los puntos en el mapa con una polilínea
            const routeCoordinates = data.map(point => {
                const latLng = { lat: parseFloat(point.latitude), lng: parseFloat(point.longitude) };
                bounds.extend(latLng);

                // Crear un marcador con InfoWindow
                const marker = new google.maps.Marker({
                    position: latLng,
                    map: mapRoute,
                    icon: {
                        url: `http://maps.google.com/mapfiles/ms/icons/${i === 0 ? "red" : "blue"}-dot.png`,
                    },
                    title: `Velocidad: ${point.velocidad}, RPM: ${point.rpm}, Hora: ${point.timestamp}`,
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `<div>
                                <p><strong>Velocidad:</strong> ${point.velocidad} km/h</p>
                                <p><strong>RPM:</strong> ${point.rpm}</p>
                                <p><strong>Fecha:</strong> ${point.timestamp}</p>
                              </div>`,
                });

                marker.addListener("click", () => {
                    infoWindow.open(mapRoute, marker);
                });

                markers.push(marker);
                return latLng;
            });

            const newPolyline = new google.maps.Polyline({
                ...polylineOptions,
                path: routeCoordinates,
            });

            routePolylines.push(newPolyline);
            newPolyline.setMap(mapRoute);
        }

        mapRoute.fitBounds(bounds);

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al procesar la solicitud.");
    }
}

function drawSearchCircle(lat, lng, radius, color) {
    const searchCircle = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.2,
        map: mapRoute,
        center: { lat, lng },
        radius: parseFloat(radius),
    });

    searchCircles.push(searchCircle);
}

function getPolylineOptions(endpoint) {
    if (endpoint === "get_route.php" || endpoint === "check_proximity.php") {
        return {
            geodesic: true,
            strokeColor: "#FF5733", // Naranja para Vehículo 1
            strokeOpacity: 0.8,
            strokeWeight: 4,
        };
    } else if (endpoint === "get_route2.php" || endpoint === "check_proximity2.php") {
        return {
            geodesic: true,
            strokeColor: "#33CFFF", // Azul para Vehículo 2
            strokeOpacity: 0.8,
            strokeWeight: 4,
            strokeDasharray: "10,5", // Líneas punteadas
        };
    }
    return {};
}

function clearMap() {
    routePolylines.forEach(polyline => polyline.setMap(null));
    routePolylines = [];
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    searchCircles.forEach(circle => circle.setMap(null));
    searchCircles = [];
    clearMessage(); // Limpiar mensajes
}

function displayMessage(message) {
    const messageContainer = document.getElementById("message-container");
    messageContainer.innerText = message;
}

function clearMessage() {
    const messageContainer = document.getElementById("message-container");
    messageContainer.innerText = "";
}
>>>>>>> jorgecambios
