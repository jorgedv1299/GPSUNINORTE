let mapRoute; // Mapa de Google Maps
let markers = [];
let routePolylines = [];
let autocomplete;
let ubicacionContainerVisible = false; // Estado inicial del subcontenedor
let searchCircles = []; // Arreglo para manejar múltiples círculos
let centralMarker; // Marcador del lugar central seleccionado

function initMapRoute() {
    mapRoute = new google.maps.Map(document.getElementById('map-container'), {
        zoom: 15,
        center: { lat: 11.0190513, lng: -74.8511425 }
    });

    autocomplete = new google.maps.places.Autocomplete(document.getElementById('ubicacion'));
    autocomplete.bindTo('bounds', mapRoute);

    document.getElementById("buscar").addEventListener("click", handleSearch);
    document.getElementById("buscar-ubicacion").addEventListener("click", handleLocationSearch);
    document.getElementById("inicio").addEventListener("change", actualizarFechaFin); // Actualiza fecha final
    document.getElementById("fin").addEventListener("change", actualizarFechaInicio); // Actualiza fecha inicio
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

function actualizarFechaFin() {
    const fechaInicio = document.getElementById("inicio").value;
    const fechaFin = document.getElementById("fin");
    if (fechaInicio) {
        fechaFin.min = fechaInicio; // Establece la fecha mínima para el campo de fecha final
    }
}

function actualizarFechaInicio() {
    const fechaFin = document.getElementById("fin").value;
    const fechaInicio = document.getElementById("inicio");
    if (fechaFin) {
        fechaInicio.max = fechaFin; // Establece la fecha máxima para el campo de fecha inicio
    }
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
            displayMessage("No hay información disponible en ese rango de tiempo.");
            return;
        } else {
            clearMessage(); // Limpiar cualquier mensaje previo si hay datos
        }

        let bounds = new google.maps.LatLngBounds();
        allData.forEach(({ endpoint, data }) => {
            const routeCoordinates = data.map(point => ({ lat: parseFloat(point.lat), lng: parseFloat(point.lng) }));

            // Configurar las flechas en la polilínea
            const arrowSymbol = {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                strokeColor: endpoint === "get_route.php" ? "#FF5733" : "#33CFFF", // Naranja para Vehículo 1, Azul para Vehículo 2
            };

            const newPolyline = new google.maps.Polyline({
                ...getPolylineOptions(endpoint),
                path: routeCoordinates,
                icons: [
                    {
                        icon: arrowSymbol,
                        offset: "100%", // Flecha al final
                        repeat: "50px", // Repetir cada 50px
                    },
                ],
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

        // Centrar el mapa en la ubicación seleccionada
        mapRoute.setCenter({ lat, lng });
        mapRoute.setZoom(15);

        // Crear un marcador para la ubicación seleccionada
        if (centralMarker) centralMarker.setMap(null); // Eliminar marcador previo si existe
        centralMarker = new google.maps.Marker({
            position: { lat, lng },
            map: mapRoute,
            icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png", // Marcador amarillo para el lugar seleccionado
            },
            title: "Ubicación Seleccionada",
        });

        // Determinar el color del círculo según el tipo de consulta
        let circleColor = "#FFD700"; // Amarillo por defecto
        if (tipoConsulta === "Vehículo 1") {
            circleColor = "#FF0000"; // Rojo para Vehículo 1
        } else if (tipoConsulta === "Vehículo 2") {
            circleColor = "#0000FF"; // Azul para Vehículo 2
        } else if (tipoConsulta === "Ambos") {
            circleColor = "#800080"; // Púrpura para la combinación de ambos
        }

        // Dibujar un círculo del radio
        drawSearchCircle(lat, lng, radio, circleColor, 0.3); // Círculo semitransparente

        let bounds = new google.maps.LatLngBounds();
        let noDataCount = 0; // Contador para verificar si no hay datos para ambos vehículos
        let hasDataForVehicle = [false, false]; // Indica si hay datos para cada vehículo

        for (let i = 0; i < endpoints.length; i++) {
            const endpoint = endpoints[i];
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng, radio, inicio, fin }),
            });

            const data = await response.json();

            if (data.length === 0) {
                if (tipoConsulta === "Vehículo 1") {
                    displayMessage("No se encontró información para el vehículo 1 en el radio seleccionado.");
                } else if (tipoConsulta === "Vehículo 2") {
                    displayMessage("No se encontró información para el vehículo 2 en el radio seleccionado.");
                } else if (tipoConsulta === "Ambos" && noDataCount === 1) {
                    displayMessage("No se encontró información para los vehículos en el radio seleccionado.");
                }
                noDataCount++; // Incrementa si no hay datos
            } else {
                hasDataForVehicle[i] = true; // Marca que hay datos para este vehículo
                clearMessage(); // Limpia cualquier mensaje previo si hay datos

                const polylineOptions = getPolylineOptions(endpoint);

                // Dibujar los puntos en el mapa con una polilínea y flechas
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
                        content: `<div style="color: ${i === 0 ? "red" : "blue"};">
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

                const arrowSymbol = {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 3,
                    strokeColor: i === 0 ? "#FF5733" : "#33CFFF", // Naranja o azul según el vehículo
                };

                const newPolyline = new google.maps.Polyline({
                    ...polylineOptions,
                    path: routeCoordinates,
                    icons: [
                        {
                            icon: arrowSymbol,
                            offset: "100%", // Flecha al final
                            repeat: "50px", // Repetir cada 50px
                        },
                    ],
                });

                routePolylines.push(newPolyline);
                newPolyline.setMap(mapRoute);
            }
        }

        if (noDataCount === endpoints.length) {
            displayMessage("No se encontró información para los vehículos en el radio seleccionado.");
        } else {
            mapRoute.fitBounds(bounds);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al procesar la solicitud.");
    }
}

function drawSearchCircle(lat, lng, radius, color, opacity) {
    const searchCircle = new google.maps.Circle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: opacity,
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
    if (centralMarker) centralMarker.setMap(null); // Limpia el marcador central
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

// Obtenemos los elementos de las fechas
const fechaInicio = document.getElementById("inicio");
const fechaFin = document.getElementById("fin");

// Evento para actualizar la fecha mínima del campo de fin
fechaInicio.addEventListener("change", () => {
    // Tomar el valor seleccionado en fechaInicio
    const fechaSeleccionada = fechaInicio.value;

    // Establecerla como fecha mínima en fechaFin
    fechaFin.min = fechaSeleccionada;

    // Opcional: Si la fecha y hora de fin actual es menor a la nueva fecha mínima, reiniciarla
    if (fechaFin.value && new Date(fechaFin.value) < new Date(fechaSeleccionada)) {
        fechaFin.value = "";
    }
});

// Validación adicional al intentar seleccionar la fecha de fin
fechaFin.addEventListener("input", () => {
    const inicioSeleccionado = new Date(fechaInicio.value);
    const finSeleccionado = new Date(fechaFin.value);

    // Si la fecha y hora de fin es menor que la de inicio, se reinicia
    if (finSeleccionado < inicioSeleccionado) {
        alert("La fecha y hora de fin no puede ser menor que la de inicio.");
        fechaFin.value = "";
    }
});
