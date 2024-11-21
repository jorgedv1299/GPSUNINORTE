// Función para actualizar los valores de velocidad en la interfaz del vehículo 1
function updateSpeed1(speed) {
    document.getElementById('speed').textContent = speed.toFixed(0);
}

// Función para actualizar los valores de RPM en la interfaz del vehículo 1
function updateRPM1(rpm) {
    document.getElementById('rpm').textContent = rpm.toFixed(0);
}

// Función para actualizar los valores de velocidad en la interfaz del vehículo 2
function updateSpeed2(speed) {
    document.getElementById('speed2').textContent = speed.toFixed(0);
}

// Función para actualizar los valores de RPM en la interfaz del vehículo 2
function updateRPM2(rpm) {
    document.getElementById('rpm2').textContent = rpm.toFixed(0);
}

// Función para obtener los datos de velocidad y RPM del vehículo 1
function fetchDataVehicle1() {
    fetch('get_location.php') // Ruta de tu archivo PHP para el vehículo 1
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta de la red para el vehículo 1');
            }
            return response.json();
        })
        .then(data => {
            if (typeof data.speed === 'number' && typeof data.rpm === 'number') {
                updateSpeed1(data.speed);
                updateRPM1(data.rpm);
            } else {
                console.error('Datos no válidos para el vehículo 1:', data);
            }
        })
        .catch(error => console.error('Error al obtener datos del vehículo 1:', error));
}

// Función para obtener los datos de velocidad y RPM del vehículo 2
function fetchDataVehicle2() {
    fetch('get_location2.php') // Ruta de tu archivo PHP para el vehículo 2
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta de la red para el vehículo 2');
            }
            return response.json();
        })
        .then(data => {
            if (typeof data.speed === 'number' && typeof data.rpm === 'number') {
                updateSpeed2(data.speed);
                updateRPM2(data.rpm);
            } else {
                console.error('Datos no válidos para el vehículo 2:', data);
            }
        })
        .catch(error => console.error('Error al obtener datos del vehículo 2:', error));
}

// Llamar a fetchDataVehicle1 y fetchDataVehicle2 cada segundo para actualizar los datos de ambos vehículos en tiempo real
setInterval(fetchDataVehicle1, 1000);
setInterval(fetchDataVehicle2, 1000);
