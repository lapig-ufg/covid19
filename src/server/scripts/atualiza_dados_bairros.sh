#!/bin/bash

BASESTORAGE='/STORAGE/ows-cache/layers'
BASELOCAL='/APP/covid19/src/server/scripts'

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

cd $BASESTORAGE

cd casos_por_bairro_covid-tiles/

rm -rfv *

#Step 3

clear
echo -n -e "Limpando Rastros!"
sleep 2

cd $BASELOCAL

rm -rfv *.csv 

