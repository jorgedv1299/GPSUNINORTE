let mapRealTime, markerRealTime, realTimePath = [], realTimePolyline;
let mapRoute, routePolyline;
let mapSearch, markerSearch;

function initMapRealTime() {
    mapRealTime = new google.maps.Map(document.getElementById('map-realtime'), {
        zoom: 15,
        center: { lat: 11.0190513, lng: -74.8511425 }
    });
    markerRealTime = new google.maps.Marker({
        position: { lat: 11.0190513, lng: -74.8511425 },
        map: mapRealTime,
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: new google.maps.Size(30, 30)
        }
    });

    realTimePolyline = new google.maps.Polyline({
        path: realTimePath,
        geodesic: true,
        strokeColor: "#0000FF",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    .setMap(mapRealTime);

    setInterval(() => {
        fetch('get_location.php')
        .then(response => response.json())
        .then(data => {
            const { latitud, longitud, timestamp } = data;

            document.getElementById('latitud').innerText = latitud;
            document.getElementById('longitud').innerText = longitud;
            document.getElementById('timestamp').innerText = timestamp;

            const newPosition = { lat: parseFloat(latitud), lng: parseFloat(longitud) };
            markerRealTime.setPosition(newPosition);
            mapRealTime.setCenter(newPosition);

            realTimePath.push(newPosition);
            realTimePolyline.setPath(realTimePath);

        })
        .catch(error => console.error('Error al obtener la ubicación en tiempo real:', error));
    }, 5000);
}

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
            fetch(url)
            .then(response => response.json())
            .then(data => {
                const routePath = data.map(point => ({ lat: parseFloat(point.latitud), lng: parseFloat(point.longitud) }));

                if (routePolyline) {
                    routePolyline.setMap(null);
                }

                routePolyline = new google.maps.Polyline({
                    path: routePath,
                    geodesic: true,
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                routePolyline.setMap(mapRoute);
                mapRoute.setCenter(routePath[0]);
            })
            .catch(error => console.error('Error al obtener el recorrido:', error));
        } else {
            alert('Por favor, seleccione una fecha de inicio y final.');
        }
    });
}

function initMapSearch() {
    mapSearch = new google.maps.Map(document.getElementById('map-search'), {
            zoom: 15,
            center: { lat: 11.0190513, lng: -74.8511425 }
    });

    const autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));
    autocomplete.addListener('place_changed', function () {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                    alert('No se pudo obtener la ubicación de la dirección ingresada.');
                    return;
            }

            if (markerSearch) {
                    markerSearch.setMap(null);
            }

            const position = place.geometry.location;
            markerSearch = new google.maps.Marker({
                    position: position,
                    map: mapSearch,
                    title: place.formatted_address
            });
            mapSearch.setCenter(position);

            // Log de la dirección y coordenadas
            const logDiv = document.getElementById('log');
            const logMessage = `${new Date().toLocaleString()}: ${place.formatted_address} | Enviando a check_proximity.php: lat=${position.lat()}, lng=${position.lng()}`;
            logDiv.innerHTML = `<div>${logMessage}</div>`; // Solo mostrar el último mensaje

            fetch(`check_proximity.php?lat=${position.lat()}&lng=${position.lng()}`)
            .then(response => response.json())
            .then(data => {
                    console.log(data); // Verificar la respuesta del servidor
                    const tbody = document.querySelector('#proximity-table tbody');
                    tbody.innerHTML = ''; // Limpiar contenido anterior

                    // Mostrar la cantidad de veces que se ha pasado por el lugar
                    document.getElementById('visit-count').innerText = `Cantidad de visitas: ${data.locations.length}`;

                    // Crear un array para almacenar las ubicaciones para la polilínea
                    const pathForPolyline = [];

                    // Solo mostrar los datos que cumplen la condición de proximidad en la tabla
                    if (data.locations.length > 0) {
                            data.locations.forEach(row => {
                                    const tr = document.createElement('tr');
                                    tr.innerHTML = `<td>${row.fecha}</td>`; // Solo mostrar la fecha
                                    tbody.appendChild(tr);
                                    
                                    // Agregar los datos para la polilínea desde antes y después
                                    if (data.proximityData.before[row.fecha]) {
                                            pathForPolyline.push(...data.proximityData.before[row.fecha].map(item => ({
                                                    lat: parseFloat(item.latitud),
                                                    lng: parseFloat(item.longitud)
                                            })));
                                    }
                                    if (data.proximityData.after[row.fecha]) {
                                            pathForPolyline.push(...data.proximityData.after[row.fecha].map(item => ({
                                                    lat: parseFloat(item.latitud),
                                                    lng: parseFloat(item.longitud)
                                            })));
                                    }
                            });

                            // Trazar la polilínea en el mapa de búsqueda solo con ubicaciones dentro del radio
                            if (routePolyline) {
                                    routePolyline.setMap(null); // Limpiar la polilínea anterior
                            }

                            // Crear y mostrar la polilínea solo si hay puntos
                            if (pathForPolyline.length > 0) {
                                    routePolyline = new google.maps.Polyline({
                                            path: pathForPolyline,
                                            geodesic: true,
                                            strokeColor: "#FF0000",
                                            strokeOpacity: 1.0,
                                            strokeWeight: 2
                                    });
                                    routePolyline.setMap(mapSearch);
                            }
                    } else {
                            // Si no hay datos, muestra un mensaje en la tabla
                            const tr = document.createElement('tr');
                            tr.innerHTML = `<td colspan="1">No se encontraron registros dentro del radio.</td>`;
                            tbody.appendChild(tr);
                    }
            })
            .catch(error => console.error('Error al verificar la proximidad:', error));
    });
}



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

    // Activar sección por defecto
    document.getElementById('nav-realtime').click();
});

// Función que oculta el enlace del navbar según la sección activa
function updateNavbar() {
    // Obtener todos los enlaces del navbar
    const navLinks = document.querySelectorAll('nav a');
    
    // Obtener el hash actual de la URL (e.g., #realtime)
    const currentHash = window.location.hash;
    
    // Iterar sobre todos los enlaces
    navLinks.forEach(link => {
        // Si el href del enlace coincide con el hash actual, lo ocultamos
        if (link.getAttribute('href') === currentHash) {
            link.style.display = 'none';
        } else {
            // Mostrar los enlaces que no coinciden con el hash actual
            link.style.display = 'inline'; // O 'block' según el estilo de tu nav
        }
    });
}

// Ejecutar la función al cargar la página para manejar el estado inicial
window.addEventListener('load', updateNavbar);

// Escuchar cambios en el hash de la URL para actualizar la navbar dinámicamente
window.addEventListener('hashchange', updateNavbar);

