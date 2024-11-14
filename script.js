//-----------------------Declarar variables-------------------------------------------------------------------------------------

let mapRealTime, markerRealTime, realTimePath = [], realTimePolyline;
let mapRoute, routePolyline, segmentPolylines = [];
let mapSearch, markerSearch;

const iconCar1 = "https://cdn-icons-png.flaticon.com/512/1048/1048313.png";
const iconCar2 = "https://cdn-icons-png.flaticon.com/512/1048/1048361.png";

const vehicleData = {
    vehicle1: {
        latitud: "cargando...",
        longitud: "cargando...",
        timestamp: "cargando..."
    },
    vehicle2: {
        latitud: "cargando...",
        longitud: "cargando...",
        timestamp: "cargando..."
    }
};

let markerRealTimeCar1, markerRealTimeCar2;
let realTimePolylineCar1, realTimePolylineCar2;
let realTimePathCar1 = [], realTimePathCar2 = [];

//--------------------------------------Buscada Tiempo Real------------------------------------------------------------------------------------
function initMapRealTime() {
    const mapOptions = {
        center: { lat: 11.0190513, lng: -74.8511425 },
        zoom: 15,
    };

    mapRealTime = new google.maps.Map(document.getElementById("map-realtime"), mapOptions);

    // Marcador para el carro 1
    markerRealTimeCar1 = new google.maps.Marker({
        position: { lat: 11.0190513, lng: -74.8511425 },
        map: mapRealTime,
        icon: {
            url: iconCar1,
            scaledSize: new google.maps.Size(30, 30)
        }
    });

    // Marcador para el carro 2
    markerRealTimeCar2 = new google.maps.Marker({
        position: { lat: 11.0190513, lng: -74.8511425 },
        map: mapRealTime,
        icon: {
            url: iconCar2,
            scaledSize: new google.maps.Size(30, 30)
        }
    });

    // Polilíneas para cada vehículo
    realTimePolylineCar1 = new google.maps.Polyline({
        path: realTimePathCar1,
        geodesic: true,
        strokeColor: "#0000FF",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    realTimePolylineCar1.setMap(mapRealTime);

    realTimePolylineCar2 = new google.maps.Polyline({
        path: realTimePathCar2,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    realTimePolylineCar2.setMap(mapRealTime);

    // Listeners para el cambio de vista
    document.getElementById('dual-view').addEventListener('change', updateView);
    document.getElementById('check').addEventListener('change', updateView);

    // Llamada periódica para actualizar los datos de ambos vehículos
    setInterval(() => {
        const isDualView = document.getElementById('dual-view').checked;
        if (isDualView) {
            updateVehicleData(1);
            updateVehicleData(2);
        } else {
            const isCar2Selected = document.getElementById('check').checked;
            updateVehicleData(isCar2Selected ? 2 : 1);
        }
    }, 1000);
}

// Función para actualizar la posición y trayectoria de cada vehículo
function updateVehicleData(vehicleId) {
    const url = vehicleId === 1 ? 'get_location.php' : 'get_location2.php';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const { latitud, longitud, timestamp } = data;
            const newPosition = { lat: parseFloat(latitud), lng: parseFloat(longitud) };

            if (vehicleId === 1) {
                markerRealTimeCar1.setPosition(newPosition);
                realTimePathCar1.push(newPosition);
                realTimePolylineCar1.setPath(realTimePathCar1);

                if (!document.getElementById('dual-view').checked && !document.getElementById('check').checked) {
                    document.getElementById('latitud').innerText = latitud;
                    document.getElementById('longitud').innerText = longitud;
                    document.getElementById('timestamp').innerText = timestamp;
                }
            } else {
                markerRealTimeCar2.setPosition(newPosition);
                realTimePathCar2.push(newPosition);
                realTimePolylineCar2.setPath(realTimePathCar2);

                if (!document.getElementById('dual-view').checked && document.getElementById('check').checked) {
                    document.getElementById('latitud').innerText = latitud;
                    document.getElementById('longitud').innerText = longitud;
                    document.getElementById('timestamp').innerText = timestamp;
                }
            }
        })
        .catch(error => console.error(`Error al obtener la ubicación del vehículo ${vehicleId}:`, error));
}

// Función para alternar entre la vista de un solo vehículo o ambos
function updateView() {
    const isDualView = document.getElementById('dual-view').checked;
    const isCar2Selected = document.getElementById('check').checked;

    if (isDualView) {
        markerRealTimeCar1.setMap(mapRealTime);
        markerRealTimeCar2.setMap(mapRealTime);
        realTimePolylineCar1.setMap(mapRealTime);
        realTimePolylineCar2.setMap(mapRealTime);
    } else {
        markerRealTimeCar1.setMap(isCar2Selected ? null : mapRealTime);
        markerRealTimeCar2.setMap(isCar2Selected ? mapRealTime : null);
        realTimePolylineCar1.setMap(isCar2Selected ? null : mapRealTime);
        realTimePolylineCar2.setMap(isCar2Selected ? mapRealTime : null);

        const activeMarker = isCar2Selected ? markerRealTimeCar2 : markerRealTimeCar1;
        mapRealTime.setCenter(activeMarker.getPosition());
        document.getElementById('car-text').innerText = isCar2Selected ? 'Carro 2' : 'Carro 1';
    }
}

//--------------------------------------Busqueda por Ruta------------------------------------------------------------------------------------

function initMapRoute() {
    mapRoute = new google.maps.Map(document.getElementById('map-route'), {
        zoom: 15,
        center: { lat: 11.0190513, lng: -74.8511425 }
    });

    document.getElementById('show-route').addEventListener('click', () => {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (startDate && endDate) {
            const url = `get_route.php?start=${startDate}&end=${endDate}`;
            const colors = ["#FF0000", "#0000FF", "#FFA500", "#AA8CAF"];

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const routePath = data.map(point => ({ lat: parseFloat(point.latitud), lng: parseFloat(point.longitud) }));

                    if (routePolyline) {
                        routePolyline.setMap(null);
                    }
                    segmentPolylines.forEach(polyline => polyline.setMap(null));
                    segmentPolylines = [];

                    routePolyline = new google.maps.Polyline({
                        path: routePath,
                        geodesic: true,
                        strokeColor: "#FF0000",
                        strokeOpacity: 0.5,
                        strokeWeight: 2
                    });

                    for (let i = 0; i < routePath.length - 1; i++) {
                        const segmentPath = [routePath[i], routePath[i + 1]];
                        const segmentPolyline = new google.maps.Polyline({
                            path: segmentPath,
                            geodesic: true,
                            strokeColor: colors[i % colors.length],
                            strokeOpacity: 1.0,
                            strokeWeight: 2
                        });
                        segmentPolyline.setMap(mapRoute);
                        segmentPolylines.push(segmentPolyline);
                    }
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

//-------------------------------Busqueda por Direccion (Mejorada) ----------------------------------------------------------------------------------

function initMapSearch() {
    mapSearch = new google.maps.Map(document.getElementById('map-search'), {
        zoom: 15,
        center: { lat: 11.0190513, lng: -74.8511425 }
    });

    const autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));

    document.getElementById('search-address').addEventListener('click', function () {
        const place = autocomplete.getPlace();
        if (!place || !place.geometry) {
            alert('No se pudo obtener la ubicación de la dirección ingresada.');
            return;
        }

        const position = place.geometry.location;
        if (markerSearch) {
            markerSearch.setMap(null);
        }

        markerSearch = new google.maps.Marker({
            position: position,
            map: mapSearch,
            title: place.formatted_address,
            icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new google.maps.Size(30, 30)
            }
        });

        mapSearch.setCenter(position);

        // Log de la dirección y coordenadas
        const logDiv = document.getElementById('log');
        const logMessage = `${new Date().toLocaleString()}: Enviando consulta a check_proximity.php con lat=${position.lat()} y lng=${position.lng()}`;
        logDiv.innerHTML += `<div>${logMessage}</div>`; // Agrega el nuevo mensaje al log sin eliminar los anteriores

        // Captura el valor del radio ingresado
        const radius = document.getElementById("range-input").value;

        // Realizar la consulta al backend
        fetch(`check_proximity.php?lat=${position.lat()}&lng=${position.lng()}&radius=${radius}`)
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#proximity-table tbody');
                tbody.innerHTML = ''; // Limpiar el contenido anterior

                document.getElementById('visit-count').innerText = `Cantidad de visitas: ${data.locations.length}`;

                // Solo mostrar los datos que cumplen la condición de proximidad en la tabla
                if (data.locations.length > 0) {
                    data.locations.forEach(row => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${row.fecha}</td>
                            <td>${row.velocidad}</td>
                            <td>${row.rpm}</td>
                            <td>${row.latitude}</td>
                            <td>${row.longitude}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                } else {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td colspan="5">No se encontraron registros dentro del radio.</td>`;
                    tbody.appendChild(tr);
                }

                // Reactivar el botón de búsqueda
                document.getElementById('search-address').disabled = false;
            })
            .catch(error => {
                console.error('Error al verificar la proximidad:', error);

                // Mostrar error en el log
                logDiv.innerHTML += `<div>${new Date().toLocaleString()}: Error al verificar proximidad - ${error.message}</div>`;

                // Reactivar el botón de búsqueda en caso de error
                document.getElementById('search-address').disabled = false;
            });
    });

    document.getElementById('new-search').addEventListener('click', function () {
        document.getElementById('search-address').disabled = false;
        document.getElementById('new-search').style.display = 'none';
        document.getElementById('autocomplete').value = '';
        if (markerSearch) {
            markerSearch.setMap(null);
        }
        document.getElementById('log').innerHTML = ''; // Limpiar el log al reiniciar la búsqueda
        document.querySelector('#proximity-table tbody').innerHTML = '';
        document.getElementById('visit-count').innerText = '';
    });
}

//----------------------------------------------------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nav-realtime').addEventListener('click', () => {
        document.querySelectorAll('.container').forEach(container => container.style.display = 'none');
        document.getElementById('realtime-section').style.display = 'block';
        initMapRealTime();
    });

    document.getElementById('nav-search').addEventListener('click', () => {
        document.querySelectorAll('.container').forEach(container => container.style.display = 'none');
        document.getElementById('search-section').style.display = 'block';
        initMapRoute();
    });

    document.getElementById('nav-address-search').addEventListener('click', () => {
        document.querySelectorAll('.container').forEach(container => container.style.display = 'none');
        document.getElementById('address-search-section').style.display = 'block';
        initMapSearch();
    });

    document.getElementById('nav-realtime').click();
});

function updateNavbar() {
    const navLinks = document.querySelectorAll('nav a');
    const currentHash = window.location.hash;
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentHash) {
            link.style.display = 'none';
        } else {
            link.style.display = 'inline';
        }
    });
}

window.addEventListener('load', updateNavbar);
window.addEventListener('hashchange', updateNavbar);
