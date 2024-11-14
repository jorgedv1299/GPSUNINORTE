//-----------------------Declarar variables-------------------------------------------------------------------------------------

let mapRealTime, markerRealTime, realTimePath = [], realTimePolyline;
let mapRoute, routePolyline,segmentPolylines=[];
let mapSearch, markerSearch;

const iconCar1 = "https://cdn-icons-png.flaticon.com/512/1048/1048313.png"; 
const iconCar2 = "https://cdn-icons-png.flaticon.com/512/1048/1048361.png "; 

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
        // Mostrar ambos vehículos
        markerRealTimeCar1.setMap(mapRealTime);
        markerRealTimeCar2.setMap(mapRealTime);
        realTimePolylineCar1.setMap(mapRealTime);
        realTimePolylineCar2.setMap(mapRealTime);
    } else {
        // Mostrar solo el vehículo seleccionado
        markerRealTimeCar1.setMap(isCar2Selected ? null : mapRealTime);
        markerRealTimeCar2.setMap(isCar2Selected ? mapRealTime : null);
        realTimePolylineCar1.setMap(isCar2Selected ? null : mapRealTime);
        realTimePolylineCar2.setMap(isCar2Selected ? mapRealTime : null);

        // Centrarse en el marcador activo
        const activeMarker = isCar2Selected ? markerRealTimeCar2 : markerRealTimeCar1;
        mapRealTime.setCenter(activeMarker.getPosition());

        document.getElementById('car-text').innerText = isCar2Selected ? 'Carro 2' : 'Carro 1';

    }
}



//--------------------------------------Busqueda por Ruta------------------------------------------------------------------------------------

const today = new Date().toISOString().split('T')[0];
document.getElementById('start-date').value = today;
document.getElementById('end-date').value = today;



function initMapRoute(fileName, color) {
    mapRoute = mapRoute || new google.maps.Map(document.getElementById('map-route'), {
        zoom: 15,
        center: { lat: 11.0190513, lng: -74.8511425 }
    });


    // Solo procedemos si las fechas han sido ingresadas
    if (startDate && endDate) {
        const url = `${fileName}?start=${startDate}&end=${endDate}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const routePath = data.map(point => ({ lat: parseFloat(point.latitud), lng: parseFloat(point.longitud) }));

                // Limpiar rutas anteriores del mapa
                segmentPolylines.forEach(polyline => polyline.setMap(null));
                segmentPolylines = [];

                // Crear segmentos de ruta en el color especificado
                for (let i = 0; i < routePath.length - 1; i++) {
                    const segmentPath = [routePath[i], routePath[i + 1]];
                    const segmentPolyline = new google.maps.Polyline({
                        path: segmentPath,
                        geodesic: true,
                        strokeColor: color,
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });
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
}

function updateMapRoute() {
    // Limpiar rutas anteriores del mapa
    segmentPolylines.forEach(polyline => polyline.setMap(null));
    segmentPolylines = [];

    const selectedVehicle = document.getElementById("vehicle2-select").value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // Verificar que las fechas hayan sido ingresadas antes de cargar las rutas
    if (startDate && endDate) {
        if (selectedVehicle === "vehicle1") {
            initMapRoute('get_route_car1.php', "#FF0000"); // rojo para Carro 1
        } else if (selectedVehicle === "vehicle2") {
            initMapRoute('get_route_car2.php', "#0000FF"); // azul para Carro 2
        } else if (selectedVehicle === "both") {
            // Muestra ambas rutas con diferentes colores
            initMapRoute('get_route_car1.php', "#FF0000"); // rojo para Carro 1
            initMapRoute('get_route_car2.php', "#0000FF"); // azul para Carro 2
        }
    } else {
        alert('Por favor, seleccione una fecha de inicio y final.');
    }
}

// Mostrar el selector y ejecutar la función de inicialización por defecto
document.getElementById("vehicle2-select").style.display = "block";

// Configurar evento para botón "Mostrar Ruta"
document.getElementById('show-route').addEventListener('click', updateMapRoute);
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