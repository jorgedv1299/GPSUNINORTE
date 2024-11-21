#!/bin/bash

# Cambiar al directorio del repositorio

# Bucle infinito
while true; do
    # Cambiar al directorio del repositorio
    cd /var/www/html/Semana3_P2/GPSUNINORTE || exit

    # Hacer pull de los cambios del repositorio remoto
    git pull
	# Realiza git pull para obtener los últimos cambios
	git pull origin master >> /var/www/html/Semana3_P2/GPSUNINORTE/auto_pull.sh 2>&1

    # Esperar 5 segundos
    sleep 5
done
