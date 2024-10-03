#!/bin/bash

while true; do
    # Cambiar al directorio del repositorio
    cd /var/www/html/GPSUNINORTE || exit

    # Hacer pull de los cambios del repositorio remoto
    git pull

    # Esperar 5 segundos antes de repetir
    sleep 5
done
