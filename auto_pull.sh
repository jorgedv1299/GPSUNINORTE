#!/bin/bash

<<<<<<< HEAD
while true; do
    # Cambiar al directorio del repositorio
    cd /var/www/html/GPSUNINORTE || exit

    # Hacer pull de los cambios del repositorio remoto
    git pull
=======
# Cambiar al directorio del repositorio
cd /var/www/html/GPSUNINORTE || exit

while true; do
    # Hacer pull de los cambios del repositorio remoto
    git pull origin master
>>>>>>> deeeef20d1274c9cf3a13623aafba75240e6e301

    # Esperar 5 segundos antes de repetir
    sleep 5
done
<<<<<<< HEAD
=======

>>>>>>> deeeef20d1274c9cf3a13623aafba75240e6e301
