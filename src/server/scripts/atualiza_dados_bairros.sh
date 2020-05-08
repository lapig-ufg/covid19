#!/bin/bash

BASESTORAGE='/storage/ows-cache/layers'
BASELOCAL='/data/containers/APP_COVID19/APP/covid19/src/server/scripts/'

#Script de Atualização de Casos por Bairros.

#Step 0

clear
echo -n -e "Baixando Planilhas do GoogleSheets!"
sleep 2

cd $BASELOCAL

python2 download_planilha_casos.py

mv 1l_3ZlgEBdd53BZFhGktgzvnuze7s3r0QGwVQomfo1eU-worksheet0.csv bairros_casos.csv 

#Step 1

clear
echo -n -e "Atualizando O Banco de Dados!"
sleep 2

node atualiza_bairros.js

#Step 2

clear
echo -n -e "Limpando Cache dos Dados!"
sleep 2

if [[ -e "$BASESTORAGE/casos_por_bairro_covid-tiles" ]];then

clear
echo "Os diretorios existem, apagando!"
sleep 2

ssh -p 2522 root@200.137.217.158 'cd /storage; cd ows-cache/layers/; cd casos_por_bairro_covid-tiles/; rm -rfv *'

else
clear
echo "Os diretorios nao existem!"
sleep 2
clear
fi


#Step 3

clear
echo -n -e "Limpando Rastros!"
sleep 2

cd $BASELOCAL

rm -rfv *.csv 

