

// Función para actualizar la velocidad y la aguja del velocímetro
function updateSpeed(speed) {
  const speedNeedle = document.getElementById('speed-needle');
  const speedValue = document.getElementById('speed-value');
  
  // Limita la velocidad a un rango de 0 a 120 (puedes ajustar el rango según necesites)
  const maxSpeed = 120;
  speed = Math.min(speed, maxSpeed);

  // Calcula el ángulo de la aguja (por ejemplo: 0 a 180 grados)
  const speedAngle = (speed / maxSpeed) * 180 - 90; // -90 para comenzar desde la izquierda
  speedNeedle.style.transform = `rotate(${speedAngle}deg)`;
  
  // Actualiza el valor visual
  speedValue.textContent = `${speed} km/h`;
}

// Función para actualizar los RPM y la aguja del tacómetro
function updateRPM(rpm) {
  const rpmNeedle = document.getElementById('rpm-needle');
  const rpmValue = document.getElementById('rpm-value');
  
  // Limita los RPM a un rango de 0 a 8000 (puedes ajustar el rango según necesites)
  const maxRPM = 8000;
  rpm = Math.min(rpm, maxRPM);

  // Calcula el ángulo de la aguja (por ejemplo: 0 a 180 grados)
  const rpmAngle = (rpm / maxRPM) * 180 - 90; // -90 para comenzar desde la izquierda
  rpmNeedle.style.transform = `rotate(${rpmAngle}deg)`;
  
  // Actualiza el valor visual
  rpmValue.textContent = `${rpm}`;
}

// Simulación de datos cada 3 segundos
setInterval(() => {
  const randomSpeed = Math.floor(Math.random() * 121); // Simula una velocidad entre 0 y 120 km/h
  const randomRPM = Math.floor(Math.random() * 8001); // Simula RPM entre 0 y 8000
  updateSpeed(randomSpeed);
  updateRPM(randomRPM);
}, 3000); // Actualiza cada 3 segundos