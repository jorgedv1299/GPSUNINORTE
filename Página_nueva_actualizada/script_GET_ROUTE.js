let mapRoute;
let routePolyline = null;
let segmentPolylines = [];

// Variables para autocompletado y resultados
let autocomplete;

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

    // Inicializar autocompletado de Google Maps API
    const input = document.getElementById('search-address');
    autocomplete = new google.maps.places.Autocomplete(input, { fields: ['geometry'] });

    // Escuchar evento del botón de búsqueda por proximidad
    document.getElementById('search-proximity-button').addEventListener('click', () => {
        const addressInput = autocomplete.getPlace();
        if (!addressInput || !addressInput.geometry) {
            alert('Por favor selecciona una dirección válida del autocompletado.');
            return;
        }

        const latitude = addressInput.geometry.location.lat();
        const longitude = addressInput.geometry.location.lng();
        const radius = document.getElementById('search-radius').value;

        if (!radius || radius <= 0) {
            alert('Por favor ingresa un radio válido.');
            return;
        }

        const start = document.getElementById('inicio').value;
        const end = document.getElementById('fin').value;

        if (!start || !end) {
            alert('Por favor selecciona un rango de tiempo válido.');
            return;
        }

        // Llamar al backend para consultar proximidad
        fetch(`check_proximity.php?lat=${latitude}&lng=${longitude}&radius=${radius}&start=${start}&end=${end}`)
            .then(response => response.json())
            .then(data => {
                // Mostrar resultados en el contenedor
                const resultsContainer = document.getElementById('results-container');
                resultsContainer.innerHTML = '<h3>Resultados:</h3>';
                data.forEach(item => {
                    resultsContainer.innerHTML += `
                        <div>
                            <p>Latitud: ${item.latitud}, Longitud: ${item.longitud}, Fecha: ${item.timestamp}</p>
                        </div>`;
                });
            })
            .catch(error => console.error('Error al consultar proximidad:', error));
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
