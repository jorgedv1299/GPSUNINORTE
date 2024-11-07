// Función para actualizar la velocidad y la aguja del velocímetro
function updateSpeed(speed) {
  const speedNeedle = document.getElementById('speed-needle');
  const speedValue = document.getElementById('speed-value');

  const maxSpeed = 120;
  speed = Math.min(speed, maxSpeed); // Limita la velocidad al valor máximo
  const speedAngle = (speed / maxSpeed) * 180 - 90; // Calcula el ángulo de la aguja
<<<<<<< HEAD
  speedNeedle.style.transform = rotate(${speedAngle}deg);
  speedValue.textContent = ${speed} km/h;
=======
  speedNeedle.style.transform = `rotate(${speedAngle}deg)`;
  speedValue.textContent = `${speed} km/h`;
>>>>>>> origin/master
}

// Función para actualizar los RPM y la aguja del tacómetro
function updateRPM(rpm) {
  const rpmNeedle = document.getElementById('rpm-needle');
  const rpmValue = document.getElementById('rpm-value');

  const maxRPM = 8000;
  rpm = Math.min(rpm, maxRPM); // Limita el RPM al valor máximo
  const rpmAngle = (rpm / maxRPM) * 180 - 90; // Calcula el ángulo de la aguja
<<<<<<< HEAD
  rpmNeedle.style.transform = rotate(${rpmAngle}deg);
  rpmValue.textContent = ${rpm};
}

=======
  rpmNeedle.style.transform = `rotate(${rpmAngle}deg)`;
  rpmValue.textContent = `${rpm}`;
}


>>>>>>> origin/master
// Función para obtener los datos de velocidad y RPM del servidor
function fetchData() {
  fetch('Velocity&RPM.php') // Ruta de tu archivo PHP
      .then(response => {
          if (!response.ok) {
              throw new Error('Error en la respuesta de la red');
          }
          return response.json();
      })
      .then(data => {
          if (typeof data.speed === 'number' && typeof data.rpm === 'number') {
              updateSpeed(data.speed);
              updateRPM(data.rpm);
          } else {
              console.error('Datos no válidos:', data);
          }
      })
      .catch(error => console.error('Error al obtener datos:', error));
}

// Llamar a fetchData cada segundo para actualizar los datos en tiempo real
<<<<<<< HEAD
setInterval(fetchData, 1000);
=======
setInterval(fetchData, 1000);



>>>>>>> origin/master
