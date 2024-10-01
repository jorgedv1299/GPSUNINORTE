#!/bin/bash

# Cambiar al directorio del repositorio
cd /var/www/html/GPSUNINORTE || exit

while true; do
    # Hacer pull de los cambios del repositorio remoto
    git pull origin master

    # Esperar 5 segundos antes de repetir
    sleep 5
done

