#!/bin/bash

#sleep 1h

while :; do

comando=$(date +%H:%M)

if [[ "$comando" == '18:00' ]] || [[ "$comando" == '06:00' ]] || [[ "$comando" == '10:00' ]];then
                   sleep 5
                   echo -n "Atualizando Plataforma!!"
		               cd /APP/covid19/src/server/scripts/
                   /APP/covid19/src/server/scripts/atualizacao_automatica_casos.sh
                   sleep 3
                   clear
              else
              	  sleep 5 
                  clear
                  echo -n "Ainda nao sao 6:00 da tarde! e Ainda nao sao 6:00 da manha! e Ainda nao sao 10:00 da manha!"
                  sleep 3
                  clear
              fi
done 
