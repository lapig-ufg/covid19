#!/bin/bash

BASEDIR='/APP/covid19/src/server/scripts/'

while :; do

comando=$(date +%H:%M)

if [[ "$comando" == '18:00' ]] || [[ "$comando" == '06:00' ]] || [[ "$comando" == '10:00' ]] || [[ "$comando" == '22:00' ]] || [[ "$comando" == '20:00' ]];then
                   sleep 5
                   echo -n "Atualizando Plataforma!!"
		               cd $BASEDIR
                   chmod -R 777 *
                   /APP/covid19/src/server/scripts/atualizacao_automatica_casos.sh
                   sleep 3
                   clear
              else
              	  sleep 5 
                  clear
                  echo -n "Ainda nao sao 6:00 da tarde! e Ainda nao sao 6:00 da manha! e Ainda nao sao 10:00 da manha! e Ainda nao sao 22:00 da noite! e Ainda nao sao 10:00 da noite!"
                  sleep 3
                  clear
              fi
done 
