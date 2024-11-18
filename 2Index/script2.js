    function clean() {
            if (ruta) {
                mymap.removeLayer(ruta);
            }
            if (marcadorInicio) {
                mymap.removeLayer(marcadorInicio);
            }
            if (marcadorFin) {
                mymap.removeLayer(marcadorFin);
            }
            if (ruta2) {
                mymap.removeLayer(ruta2);
            }
            if (marker) {
                mymap.removeLayer(marker);
            }
            if (markend) {
                mymap.removeLayer(markend);
            }
            if (ruta3) {
                mymap.removeLayer(ruta3);
            }
            if (mark) {
                mymap.removeLayer(mark);
            }
            if (mend) {
                mymap.removeLayer(mend);
            }
            if (ruta4) {
                mymap.removeLayer(ruta4);
            }
            if (mark2) {
                mymap.removeLayer(mark2);
            }
            if (mend2) {
                mymap.removeLayer(mend2);
            }
        }

        function limpiarFechas() {
            flatpickr("#inicio").clear();
            flatpickr("#fin").clear();
            flatpickr("#inicio2").clear();
            flatpickr("#fin2").clear();
            flatpickr("#inicio3").clear();
            flatpickr("#fin3").clear();
        }

        var cuestionarioActivo = null;

        function mostrarCuestionario1() {
            var cuestionario1 = document.getElementById("cuestionario1");
            
            // Si hay un cuestionario activo, ocúltalo
             if (cuestionarioActivo) {
                cuestionarioActivo.style.display = "none";
            }

            // Muestra el nuevo cuestionario
            cuestionario1.style.display = "block";

            // Actualiza el cuestionario activo
            cuestionarioActivo = cuestionario1;

            clean();
            limpiarFechas();

            flatpickr("#inicio", {
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                time_24hr: true,
                maxDate: "today",
                defaultDate: "01:00",
                onClose: function(selectedDates) {
                    // Configurar la fecha mínima para el campo de fecha de fin
                    var minDate = selectedDates[0];
                    flatpickr("#fin", {
                        enableTime: true,
                        dateFormat: "Y-m-d H:i",
                        time_24hr: true,
                        minDate: minDate,
                        maxDate: "today",
                        defaultDate: "23:59",
                    });               
                }  
            });

            $('#recenter-button').click(function() {
             mymap.setView(marcadorInicio.getLatLng());
            });
        }

        function mostrarCuestionario2() {
            var cuestionario2 = document.getElementById("cuestionario2");

            // Si hay un cuestionario activo, ocúltalo
            if (cuestionarioActivo) {
                cuestionarioActivo.style.display = "none";
            }

            // Muestra el nuevo cuestionario
            cuestionario2.style.display = "block";

            // Actualiza el cuestionario activo
            cuestionarioActivo = cuestionario2;

            clean();
            limpiarFechas();

            flatpickr("#inicio2", {
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                time_24hr: true,
                maxDate: "today",
                defaultDate: "01:00",
                onClose: function(selectedDates) {
                    // Configurar la fecha mínima para el campo de fecha de fin
                    var minDate = selectedDates[0];
                    flatpickr("#fin2", {
                        enableTime: true,
                        dateFormat: "Y-m-d H:i",
                        time_24hr: true,
                        minDate: minDate,
                        maxDate: "today",
                        defaultDate: "23:59",
                    });               
                }  
            });

            $('#recenter-button').click(function() {
             mymap.setView(marker.getLatLng());
            });
        }

        function mostrarCuestionario3() {
            var cuestionario3 = document.getElementById("cuestionario3");

            // Si hay un cuestionario activo, ocúltalo
            if (cuestionarioActivo) {
                cuestionarioActivo.style.display = "none";
            }

            // Muestra el nuevo cuestionario
            cuestionario3.style.display = "block";

            // Actualiza el cuestionario activo
            cuestionarioActivo = cuestionario3;

            clean();
            limpiarFechas();

            flatpickr("#inicio3", {
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                time_24hr: true,
                maxDate: "today",
                defaultDate: "01:00",
                onClose: function(selectedDates) {
                    // Configurar la fecha mínima para el campo de fecha de fin
                    var minDate = selectedDates[0];
                    flatpickr("#fin3", {
                        enableTime: true,
                        dateFormat: "Y-m-d H:i",
                        time_24hr: true,
                        minDate: minDate,
                        maxDate: "today",
                        defaultDate: "23:59",
                    });               
                }  
            });
            $('#recenter-button').click(function() {
             mymap.setView(mark.getLatLng());
            });
        }
        
        // Añadir capa de OpenStreetMap al mapa
        var mymap = L.map('map').setView([10.99912735754, -74.81467299], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);

        window.onload = function() {
            Swal.fire({
                title: "¡Bienvenido a la consulta histórica!",
                html: "Paso 1: Selecciona el vehículo que quieres visualizar.<br><br>Paso 2: Selecciona la fecha y hora de inicio en el primer campo.<br><br>Paso 3: Selecciona la fecha y hora de fin en el segundo campo.<br><br>Paso 4: Haz clic en el botón 'Consultar historial' para ver las coordenadas históricas del vehículo.<br><br>Paso 5: Utiliza el control deslizante de tiempo para ver el historial de ubicaciones.",
                icon: "info",
                iconColor: "#fda2ba",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#cc3b62" // Color del botón de confirmación
            });
        }    

        var ruta;
        var marcadorInicio;
        var marcadorFin;
        
        function obtenerCoordenadasHistoricas() {
            var inicio = $("#inicio").val();
            var fin = $("#fin").val();

            clean();

            $.ajax({
                url: '/consulta_historica',
                type: 'POST',
                data: {inicio: inicio, fin: fin},
                success: function(data) {
                    // Tratar la respuesta del servidor y trazar la polilínea en el mapa
                    var coordenadas = data.coordenadas;
                    var historialCoords = [];
                    var timestamps = []; // Crear un array para almacenar los timestamps

                    for (var i = 0; i < coordenadas.length; i++) {
                        var latitud = parseFloat(coordenadas[i].latitud);
                        var longitud = parseFloat(coordenadas[i].longitud);
                        var timestamp = new Date(coordenadas[i].timestamp); // Obtener el timestamp de cada coordenada
                        historialCoords.push([latitud, longitud]);
                        timestamps.push(timestamp); // Agregar el timestamp al array
                    }
                    clean();
                    if (coordenadas.length === 0) {
                        alert("No hay recorridos disponibles.");
                        return;
                    }

                    ruta = L.polyline(historialCoords, {color: '#cc3b3b'}).addTo(mymap);
                    var bounds = ruta.getBounds();
                    mymap.fitBounds(bounds);

                    var primerPunto = historialCoords[0];
                    var ultimoPunto = historialCoords[historialCoords.length - 1];

                    marcadorInicio = L.marker(primerPunto, { 
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<i class="fa-solid fa-location-crosshairs fa-2xl" style="color: #3f5a8d;"></i>',
                        })
                    }).addTo(mymap);

                    marcadorInicio.bindPopup("Punto inicial", {
                        autoClose: false // Evita que se cierre automáticamente al abrir otro popup
                    }).openPopup();

                    marcadorFin = L.marker(ultimoPunto, {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<i class="fa-solid fa-flag-checkered fa-2xl" style="color: #000000;"></i>',
                        })
                    }).addTo(mymap);

                    marcadorFin.bindPopup("Fin de recorrido")

                    marcadorInicio.timestamp = timestamps[0];

                    var maxSliderValue = historialCoords.length - 1;
                    $('#time-slider').attr('max', maxSliderValue);
                    
                    $('#time-slider').attr('min', 0);
                    
                    $('#time-slider').on('input', function() {
                        var sliderValue = parseFloat($(this).val());
                        var index = Math.round(sliderValue); // Obtener el índice correspondiente
                        var newPosition = historialCoords[index]; // Obtener la nueva posición del marcador
                        marcadorInicio.setLatLng(newPosition); // Actualizar la posición del marcador
                        
                        var timestamp = timestamps[index];
                        actualizarPopup(newPosition, timestamp);
                    });
                }
            });
        }

        var ruta2;
        var marker;
        var markend;

        function obtenerCoordenadasHistoricas2() {
            var inicio2 = $("#inicio2").val();
            var fin2 = $("#fin2").val();

            clean();

            $.ajax({
                url: '/consulta_data',
                type: 'POST',
                data: {inicio2: inicio2, fin2: fin2},
                success: function(data) {
                    // Tratar la respuesta del servidor y trazar la polilínea en el mapa
                    var coordenadas = data.coordenadas;
                    var historialCoords = [];
                    var timestamps = []; // Crear un array para almacenar los timestamps
                    var rpms = [];
                    
                    for (var i = 0; i < coordenadas.length; i++) {
                        var latitud = parseFloat(coordenadas[i].latitud);
                        var longitud = parseFloat(coordenadas[i].longitud);
                        var timestamp = new Date(coordenadas[i].timestamp); // Obtener el timestamp de cada coordenada
                        var rpm = parseFloat(coordenadas[i].rpm);
                        historialCoords.push([latitud, longitud]);
                        timestamps.push(timestamp); // Agregar el timestamp al array
                        rpms.push(rpm);
                    }
                    clean();
                    if (coordenadas.length === 0) {
                        alert("No hay recorridos disponibles.");
                        return;
                    }

                    ruta2 = L.polyline(historialCoords, {color: '#863bcc'}).addTo(mymap);
                    var bounds2 = ruta2.getBounds();
                    mymap.fitBounds(bounds2);

                    var primero = historialCoords[0];
                    var end = historialCoords[historialCoords.length - 1];

                    marker = L.marker(primero, { 
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<i class="fa-solid fa-location-crosshairs fa-2xl" style="color: #3f5a8d;"></i>',
                        })
                    }).addTo(mymap);

                    marker.bindPopup("Punto inicial", {
                        autoClose: false // Evita que se cierre automáticamente al abrir otro popup
                    }).openPopup();

                    markend = L.marker(end, {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<i class="fa-solid fa-flag-checkered fa-2xl" style="color: #000000;"></i>',
                        })
                    }).addTo(mymap);

                    markend.bindPopup("Fin de recorrido")

                    marker.timestamp = timestamps[0];
                    
                    var maxSliderValue2 = historialCoords.length - 1;
                    $('#time-slider2').attr('max', maxSliderValue2);
                    
                    $('#time-slider2').attr('min', 0);
                    
                    $('#time-slider2').on('input', function() {
                        var sliderValue = parseFloat($(this).val());
                        var index = Math.round(sliderValue); // Obtener el índice correspondiente
                        var newPosition = historialCoords[index]; // Obtener la nueva posición del marcador
                        marker.setLatLng(newPosition); // Actualizar la posición del marcador
                        
                        var timestamp = timestamps[index];
                        var rpm = rpms[index]; // Obtener las RPM correspondientes al índice
                        actualizarPopup2(newPosition, timestamp, rpm);

                    });
                }
            });
        }
        
        var ruta3;
        var mark;
        var mend;

        var ruta4;
        var mark2;
        var mend2;

function obtenerCoordenadasHistoricas3() {
            var inicio3 = $("#inicio3").val();
            var fin3 = $("#fin3").val();

            clean();

            $.ajax({
                url: '/consulta_dos',
                type: 'POST',
                data: {inicio3: inicio3, fin3: fin3},
                success: function(data) {
                    // Tratar la respuesta del servidor y trazar la polilínea en el mapa
                    var coordenadas = data.coordenadas;
                    var historialCoords = [];
                    var timestamps1 = []; // Array de timestamps para la tabla de coordenadas
                    
                    for (var i = 0; i < coordenadas.length; i++) {
                        var latitud = parseFloat(coordenadas[i].latitud);
                        var longitud = parseFloat(coordenadas[i].longitud);
                        var timestamp = new Date(coordenadas[i].timestamp);
                        historialCoords.push([latitud, longitud]);
                        timestamps1.push(timestamp);
                    }

                    clean();
                    
                    var datos = data.datos;
                    var datosCoords = [];
                    var timestamps2 = []; // Array de timestamps para la tabla de datos
                    var rpms = []; // Array de RPMs para la tabla de datos

                    for (var i = 0; i < datos.length; i++) {
                        var latitud = parseFloat(datos[i].latitud);
                        var longitud = parseFloat(datos[i].longitud);
                        var timestamp = new Date(datos[i].timestamp);
                        var rpm = parseFloat(datos[i].rpm);
                        datosCoords.push([latitud, longitud]);
                        timestamps2.push(timestamp);
                        rpms.push(rpm);
                    }
                    
                    if (coordenadas.length === 0 && datos.length === 0) {
                        alert("No hay recorridos disponibles.");
                        return;
                    }

                    // Trazar las polilíneas en el mapa
                    ruta3 = L.polyline(historialCoords, {color: 'blue'}).addTo(mymap);
                    var bounds3 = ruta3.getBounds();
                    mymap.fitBounds(bounds3);

                    ruta4 = L.polyline(datosCoords, {color: 'red'}).addTo(mymap);
                    var bounds4 = ruta4.getBounds();
                    mymap.fitBounds(bounds4);

                    // Configurar marcadores y popups
                    var prim = historialCoords[0];
                    var last = historialCoords[historialCoords.length - 1];
                    var prim2 = datosCoords[0];
                    var last2 = datosCoords[datosCoords.length - 1];

                    mark = L.marker(prim, { 
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<i class="fa-solid fa-location-crosshairs fa-2xl" style="color: #3f5a8d;"></i>',
                        })
                    }).addTo(mymap);

                    mark2 = L.marker(prim2, { 
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<i class="fa-solid fa-location-crosshairs fa-2xl" style="color: #3f5a8d;"></i>',
                        })
                    }).addTo(mymap);

                    mend = L.marker(last, {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<i class="fa-solid fa-flag-checkered fa-2xl" style="color: #000000;"></i>',
                        })
                    }).addTo(mymap);

                    mend2 = L.marker(last2, {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<i class="fa-solid fa-flag-checkered fa-2xl" style="color: #000000;"></i>',
                        })
                    }).addTo(mymap);

                    mark.bindPopup("Punto inicial Vehículo 2", {
                        autoClose: false // Evita que se cierre automáticamente al abrir otro popup
                    }).openPopup();

                    mark2.bindPopup("Punto inicial Vehículo 1", {
                        autoClose: false // Evita que se cierre automáticamente al abrir otro popup
                    }).openPopup();

                    mend.bindPopup("Fin de recorrido");
                    mend2.bindPopup("Fin de recorrido");

                    mark.timestamp = timestamps1[0];
                    mark2.timestamp = timestamps2[0];

                    // Configurar slider de tiempo
                    var maxSliderValue3;

                    if (historialCoords.length < datosCoords.length) {
                        maxSliderValue3 = datosCoords.length - 1;
                    } 

                    if (historialCoords.length > datosCoords.length) {
                        maxSliderValue3 = historialCoords.length - 1;
                    } 

                    $('#time-slider3').attr('max', maxSliderValue3);
                    $('#time-slider3').attr('min', 0);


                    $('#time-slider3').on('input', function() {
                        var sliderValue = parseFloat($(this).val());
                        var index = Math.round(sliderValue); // Obtener el índice correspondiente
                        
                        // Asegurarse de que el índice esté dentro del rango de historialCoords
                        var newIndex1 = Math.min(index, historialCoords.length - 1);
                        // Asegurarse de que el índice esté dentro del rango de datosCoords
                        var newIndex2 = Math.min(index, datosCoords.length - 1);

                        var newPosition = historialCoords[newIndex1]; // Obtener la nueva posición del marcador
                        mark.setLatLng(newPosition); // Actualizar la posición del marcador
                        var timestamp = timestamps1[newIndex1];
                        actualizarPopup3(newPosition, timestamp);

                        var newPosition2 = datosCoords[newIndex2]; // Obtener la nueva posición del marcador
                        mark2.setLatLng(newPosition2); // Actualizar la posición del marcador
                        var timestamp2 = timestamps2[newIndex2];
                        var rpm = rpms[newIndex2];
                        actualizarPopup4(newPosition2, timestamp2, rpm);
                    });
                }
            });
        }

    
        // Actualizar el popup del marcador con el timestamp y la ubicación
        function actualizarPopup(latlng, timestamp) {
            var formattedTimestamp = timestamp.toLocaleString(); // Formatear el timestamp como una cadena legible
            marcadorInicio.timestamp = timestamp; // Guardar el timestamp en el marcador
            marcadorInicio.bindPopup("Timestamp: " + formattedTimestamp).openPopup();
        }

        function actualizarPopup2(latlng, timestamp, rpm) {
            var formattedTimestamp = timestamp.toLocaleString(); // Formatear el timestamp como una cadena legible
            marker.timestamp = timestamp; // Guardar el timestamp en el marcador
            marker.rpm = rpm; // Guardar las RPM en el marcador
            marker.bindPopup("Timestamp: " + formattedTimestamp + "<br>RPM: " + rpm).openPopup();
        }

        function actualizarPopup3(latlng, timestamp) {
            var formattedTimestamp = timestamp.toLocaleString(); // Formatear el timestamp como una cadena legible
            mark.timestamp = timestamp; // Guardar el timestamp en el marcador
            mark.bindPopup("Timestamp: " + formattedTimestamp).openPopup();
        }

        function actualizarPopup4(latlng, timestamp, rpm) {
            var formattedTimestamp = timestamp.toLocaleString(); // Formatear el timestamp como una cadena legible
            mark2.timestamp = timestamp; // Guardar el timestamp en el marcador
            mark2.rpm = rpm; // Guardar las RPM en el marcador
            mark2.bindPopup("Timestamp: " + formattedTimestamp + "<br>RPM: " + rpm).openPopup();
        }



        
        // Evento click del botón para consultar históricos
        $('#consultar-historicos-btn').click(function() {
            obtenerCoordenadasHistoricas();
            $('#time-slider').val(0);
            $('#time-slider2').val(0);
            $('#time-slider3').val(0);
        });

         // Evento click del botón para consultar históricos
         $('#consultar-historicos-btn2').click(function() {
            obtenerCoordenadasHistoricas2();
            $('#time-slider').val(0);
            $('#time-slider2').val(0);
            $('#time-slider3').val(0);
        });

         // Evento click del botón para consultar históricos
         $('#consultar-historicos-btn3').click(function() {
            obtenerCoordenadasHistoricas3();
            $('#time-slider').val(0);
            $('#time-slider2').val(0);
            $('#time-slider3').val(0);
        });

        
  