let mapRoute;
let routePolyline = null;
let segmentPolylines = [];

function initMapRoute() {
    // Inicializar el mapa dentro de map-container
    mapRoute = new google.maps.Map(document.getElementById('map-container'), {
        zoom: 15,
        center: { lat: 11.0190513, lng: -74.8511425 }
    });

    // Escuchar el evento click del botón para mostrar la ruta
    document.getElementById('show-route').addEventListener('click', () => {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (startDate && endDate) {
            // Construir la URL para obtener las coordenadas
            const url = `get_route.php?start=${startDate}&end=${endDate}`;
            const colors = ["#FF0000", "#0000FF", "#FFA500", "#AA8CAF"]; // colores de segmentos

            // Hacer la solicitud al servidor
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    // Mapear los puntos de la ruta
                    const routePath = data.map(point => ({
                        lat: parseFloat(point.latitud),
                        lng: parseFloat(point.longitud)
                    }));

                    // Limpiar el mapa de polilíneas previas
                    if (routePolyline) {
                        routePolyline.setMap(null);
                    }
                    segmentPolylines.forEach(polyline => polyline.setMap(null));
                    segmentPolylines = [];

                    // Dibujar la ruta completa (opcional)
                    routePolyline = new google.maps.Polyline({
                        path: routePath,
                        geodesic: true,
                        strokeColor: "#FF0000",
                        strokeOpacity: 0.5,
                        strokeWeight: 2
                    });

                    // Dibujar segmentos de la ruta
                    for (let i = 0; i < routePath.length - 1; i++) {
                        const segmentPath = [routePath[i], routePath[i + 1]];
                        const segmentPolyline = new google.maps.Polyline({
                            path: segmentPath,
                            geodesic: true,
                            strokeColor: colors[i % colors.length],
                            strokeOpacity: 1.0,
                            strokeWeight: 2
                        });

                        // Mostrar el segmento en el mapa
                        segmentPolyline.setMap(mapRoute);
                        segmentPolylines.push(segmentPolyline);
                    }

                    // Centrar el mapa en el primer punto de la ruta
                    if (routePath.length > 0) {
                        mapRoute.setCenter(routePath[0]);
                    }
                })
                .catch(error => console.error('Error al obtener el recorrido:', error));
        } else {
            alert('Por favor, seleccione una fecha de inicio y final.');
        }
    });
}

// Llamar a la función initMapRoute cuando el script de Google Maps esté cargado
window.onload = initMapRoute;

//--------------Concatenado de calendarios--------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    let inicioPicker, finPicker;

    // Inicializar Flatpickr para la fecha de inicio
    inicioPicker = flatpickr("#inicio", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        onChange: function (selectedDates) {
            // Establecer la fecha mínima en el campo de fin cuando se selecciona una fecha de inicio
            finPicker.set("minDate", selectedDates[0]);
        }
    });

    // Inicializar Flatpickr para la fecha de fin
    finPicker = flatpickr("#fin", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        onChange: function (selectedDates) {
            // Validar que la fecha de fin no sea menor que la fecha de inicio
            const inicio = inicioPicker.selectedDates[0];
            const fin = selectedDates[0];
            if (fin < inicio) {
                alert("La fecha de fin no puede ser menor que la fecha de inicio.");
                finPicker.clear(); // Limpiar el campo de fecha de fin
            }
        }
    });
});

function consultarHistorial() {
    const inicio = document.getElementById('inicio').value;
    const fin = document.getElementById('fin').value;

    if (!inicio || !fin) {
        alert('Por favor, complete la fecha y hora de inicio y fin antes de continuar.');
        return;
    }

    const tipoConsulta = document.getElementById('form-selector').value;

    switch (tipoConsulta) {
        case 'camion':
            alert(`Consulta para Camión con parámetros: Inicio: ${inicio}, Fin: ${fin}`);
            break;
        case 'coche':
            alert(`Consulta para Coche con parámetros: Inicio: ${inicio}, Fin: ${fin}`);
            break;
        case 'mixto':
            alert(`Consulta para Mixta con parámetros: Inicio: ${inicio}, Fin: ${fin}`);
            break;
        default:
            alert('Seleccione un tipo de consulta válido.');
            break;
    }
}

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
