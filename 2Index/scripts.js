let vehicle1Path = [];  // Array para almacenar las coordenadas de la polilínea de vehículo 1
let vehicle2Path = [];  // Array para almacenar las coordenadas de la polilínea de vehículo 2

let vehicle1Marker, vehicle2Marker;
let vehicle1Polyline, vehicle2Polyline;

let isVehicle1Visible = true; // Variable para controlar la visibilidad del vehículo 1
let isVehicle2Visible = true; // Variable para controlar la visibilidad del vehículo 2

let followMode = "both";

function initMapRealTime() {
    // Inicialización del mapa centrado en una ubicación predeterminada
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 11.0190513, lng: -74.8511425 }, // Coordenadas iniciales
        zoom: 15,
        zoomControl: true,
        scaleControl: true,
        streetViewControl: false,
        mapTypeControl: false
    });

    // Crear marcador para el vehículo 1
    const vehicle1Marker = new google.maps.Marker({
        position: { lat: 11.0190513, lng: -74.8511425 }, // Coordenadas iniciales
        map: map,
        icon: {
            url: "https://cdn-icons-png.flaticon.com/512/1048/1048313.png", // Ícono del vehículo 1
            scaledSize: new google.maps.Size(40, 40), // Ajusta el tamaño del ícono
        },
        title: "Vehicle 1",
    });

    // Crear marcador para el vehículo 2
    const vehicle2Marker = new google.maps.Marker({
        position: { lat: 11.0190513, lng: -74.8511425 }, // Coordenadas iniciales
        map: map,
        icon: {
            url: "https://cdn-icons-png.flaticon.com/512/1048/1048361.png", // Ícono del vehículo 2
            scaledSize: new google.maps.Size(40, 40), // Ajusta el tamaño del ícono
        },
        title: "Vehicle 2",
    });

    // Crear polilínea para el vehículo 1
    const vehicle1Polyline = new google.maps.Polyline({
        path: vehicle1Path,  // Array de coordenadas para la polilínea
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map,
    });

    // Crear polilínea para el vehículo 2
    const vehicle2Polyline = new google.maps.Polyline({
        path: vehicle2Path,  // Array de coordenadas para la polilínea
        geodesic: true,
        strokeColor: '#0000FF', // Color de la línea
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map,
    });

    // Crear un objeto LatLngBounds para ajustar el área visible del mapa
    const bounds = new google.maps.LatLngBounds();

    // Función para actualizar los datos del Vehículo 1
    function updateVehicle1Data() {
        fetch('get_location.php')  // Cambia esta ruta a la ubicación de tu script.php para el vehículo 1
            .then(response => response.json())
            .then(data => {
                const lat = parseFloat(data.latitud);
                const lng = parseFloat(data.longitud);

                // Actualizar posición del vehículo 1 en el mapa
                vehicle1Marker.setPosition({ lat: lat, lng: lng });

                // Agregar la nueva posición a la polilínea de vehículo 1
                vehicle1Path.push({ lat: lat, lng: lng });
                vehicle1Polyline.setPath(vehicle1Path);

                // Actualizar los datos en el HTML para vehículo 1
                document.getElementById("latitud").textContent = lat.toFixed(6);
                document.getElementById("longitud").textContent = lng.toFixed(6);
                document.getElementById("timestamp").textContent = data.timestamp;

                updateFollowMode();
              
 
                
            })
            .catch(error => console.error('Error al obtener los datos del vehículo 1:', error));
    }

    // Función para actualizar los datos del Vehículo 2
    function updateVehicle2Data() {
        fetch('get_location2.php')  // Cambia esta ruta a la ubicación de tu get_location2.php
            .then(response => response.json())
            .then(data => {
                const lat = parseFloat(data.latitud);
                const lng = parseFloat(data.longitud);

                // Actualizar posición del vehículo 2 en el mapa
                vehicle2Marker.setPosition({ lat: lat, lng: lng });

                // Agregar la nueva posición a la polilínea de vehículo 2
                vehicle2Path.push({ lat: lat, lng: lng });
                vehicle2Polyline.setPath(vehicle2Path);

                // Actualizar los datos en el HTML para vehículo 2
                document.getElementById("latitud2").textContent = lat.toFixed(6);
                document.getElementById("longitud2").textContent = lng.toFixed(6);
                document.getElementById("timestamp2").textContent = data.timestamp;

                updateFollowMode();

            })
            .catch(error => console.error('Error al obtener los datos del vehículo 2:', error));
    }



    function updateFollowMode() {
        followMode = document.getElementById("vehicleSelector").value;
    
        if (followMode === "1") {
            // Seguir solo al Vehículo 1
            fetch('get_location.php')
                .then(response => response.json())
                .then(data => {
                    const lat = parseFloat(data.latitud);
                    const lng = parseFloat(data.longitud);
    
                    // Actualizar la posición del vehículo 1
                    vehicle1Marker.setPosition({ lat: lat, lng: lng });
    
                    // Centrar el mapa en el vehículo 1
                    map.setCenter({ lat: lat, lng: lng });
                })
                .catch(error => console.error('Error al obtener los datos del vehículo 1:', error));
    
        } else if (followMode === "2") {
            // Seguir solo al Vehículo 2
            fetch('get_location2.php')
                .then(response => response.json())
                .then(data => {
                    const lat = parseFloat(data.latitud);
                    const lng = parseFloat(data.longitud);
    
                    // Actualizar la posición del vehículo 2
                    vehicle2Marker.setPosition({ lat: lat, lng: lng });
                    
                    // Centrar el mapa en el vehículo 2
                    map.setCenter({ lat: lat, lng: lng });
                    
                })
                .catch(error => console.error('Error al obtener los datos del vehículo 2:', error));
    
        } else if (followMode === "both") {
            // Seguir ambos vehículos
            Promise.all([
                fetch('get_location.php').then(response => response.json()),  // Vehículo 1
                fetch('get_location2.php').then(response => response.json())  // Vehículo 2
            ])
            .then(data => {
                const lat1 = parseFloat(data[0].latitud);
                const lng1 = parseFloat(data[0].longitud);
                const lat2 = parseFloat(data[1].latitud);
                const lng2 = parseFloat(data[1].longitud);
        
                // Actualizar las posiciones de ambos vehículos
                vehicle1Marker.setPosition({ lat: lat1, lng: lng1 });
                vehicle2Marker.setPosition({ lat: lat2, lng: lng2 });
        
                // Crear un objeto LatLngBounds para ajustar el área visible del mapa
                const bounds = new google.maps.LatLngBounds();
        
                // Expandir los límites con las posiciones de ambos vehículos
                bounds.extend({ lat: lat1, lng: lng1 });
                bounds.extend({ lat: lat2, lng: lng2 });
        
                // Ajustar el mapa para que se muestre todo el área de ambos vehículos
                map.fitBounds(bounds);
            })
            .catch(error => console.error('Error al obtener los datos de los vehículos:', error));
        }
        
    }
    

    // Actualizar los datos del vehículo 1 y vehículo 2 cada 1 segundo
    setInterval(updateVehicle1Data, 1000);  // Vehículo 1
    setInterval(updateVehicle2Data, 1000);  // Vehículo 2
}



// Función para alternar la visibilidad de los vehículos y su recorrido
function toggleVehicle(vehicleNumber) {
    if (vehicleNumber === 1) {
        isVehicle1Visible = !isVehicle1Visible; // Alternar visibilidad del vehículo 1
        if (isVehicle1Visible) {
            vehicle1Marker.setMap(map);  // Mostrar el marcador
            vehicle1Polyline.setMap(map);  // Mostrar la polilínea
        } else {
            vehicle1Marker.setMap(null);  // Ocultar el marcador
            vehicle1Polyline.setMap(null);  // Ocultar la polilínea
        }
    } else if (vehicleNumber === 2) {
        isVehicle2Visible = !isVehicle2Visible; // Alternar visibilidad del vehículo 2
        if (isVehicle2Visible) {
            vehicle2Marker.setMap(map);  // Mostrar el marcador
            vehicle2Polyline.setMap(map);  // Mostrar la polilínea
        } else {
            vehicle2Marker.setMap(null);  // Ocultar el marcador
            vehicle2Polyline.setMap(null);  // Ocultar la polilínea
        }
    }
}