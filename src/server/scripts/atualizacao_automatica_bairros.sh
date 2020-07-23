#!/bin/bash

BASESTORAGE='/data/storage/ows-cache/layers'
BASELOCAL='/data/containers/APP_COVID19/APP/covid19/src/server/scripts/'

#Script de Atualização de Casos por Bairros.

echo -n -e "\nBaixando Planilhas do GoogleSheets!\n"
sleep 2

cd $BASELOCAL

python2 download_planilha_casos_bairros.py

mv 1l_3ZlgEBdd53BZFhGktgzvnuze7s3r0QGwVQomfo1eU-worksheet0.csv bairros_casos.csv
mv 1H7k1RwWqUCcqkMlr7puEx2bgftsrLk7MwEpXNkuN_F4-worksheet0.csv bairros_obitos.csv

echo -n -e "\nAtualizando O Banco de Dados para Casos!\n"
sleep 2

node atualiza_bairros.js

echo -n -e "\n\n[ Atualizando O Banco de Dados para Óbitos! ] "
sleep 2

node atualiza_bairros_obitos.js

echo -n -e "\nLimpando Cache dos Dados!\n"
sleep 2


cd $BASESTORAGE
cd casos_por_bairro_covid-tiles
rm -rfv *

cd $BASESTORAGE
cd obitos_por_bairro_covid-tiles
rm -rfv *

#Step 3

clear
echo -n -e "Limpando Rastros!"
sleep 2

cd $BASELOCAL

rm -rfv *.csv

