#!/bin/bash

# Cambiar al directorio del repositorio

# Bucle infinito
while true; do
    cd /var/www/html/GPSUNINORTE || exit

    # Ejecutar git pull
    git pull 

    # Esperar 5 segundos
    sleep 5
done
