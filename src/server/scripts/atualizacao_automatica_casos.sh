#!/bin/bash

BASEDIR='/STORAGE/ows-cache/layers'

pip install gspread >> /dev/null

#Step 1

clear
echo -n -e "Baixando Planilha casos.csv!"
sleep 2

python2 download_planilha_casos.py

mv 1I4BM9x3CKNFAwLlm_EN3RrLOBhLZK_M-SWFPmLEbohY-worksheet0.csv casos.csv

mv 1onQ_CDx2359c-ZTsmcyOm9f77JJM2zDgNXuK2VV-Kkw-worksheet0.csv estados_casos.csv
clear
echo -n -e "Planilha baixada com sucesso!"
sleep 2

#Step 2

clear
echo -n -e "Populando banco de dados!"
sleep 2
node atualiza_casos.js
node atualiza_estados_casos.js


#Step 3

clear
echo -n -e "Excluindo Cache!"
sleep 2

cd $BASEDIR

rm -r covid19_municipios_casos_utfgrid-tiles/

rm -r covid19_municipios_casos-tiles/
