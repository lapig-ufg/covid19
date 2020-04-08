#!/bin/bash

BASEDIR='/STORAGE/ows-cache/layers'

pip install gspread >> /dev/null

#Step 1

clear
echo -n -e "Baixando Planilha casos.csv!"
sleep 2

python2 download_planilha_casos.py

mv 1mlyQIUbGKB2J3UIQrCPxAORaY5HYAPlMgY61IMCu4JY-worksheet0.csv casos.csv

mv 163Agr2r4r4evn74SUkVojcdg-hq6urb0qcCMk5Pdknw-worksheet0.csv estados_casos.csv

mv 1sMzwMlPThQ0-AVYeYAxjkPQ_0G82hOEyDDh-xTlaaf4-worksheet0.csv projecao_casos_go.csv

mv 1LeLPLxMqJMiCq5VQLtjO_e7hPtXWmSZxs5t9-1lYAgU-worksheet0.csv estatisticas.csv

clear
echo -n -e "Planilha baixada com sucesso!"
sleep 2

Step 2

clear
echo -n -e "Populando banco de dados!"
sleep 2

clear
node atualiza_casos.js
sleep 2
clear
node atualiza_estados_casos.js
sleep 2
clear
node atualiza_estatisticas.js
sleep 2
clear
node atualiza_projecao.js
sleep 2

#Step 3

clear
echo -n -e "Excluindo Cache!"
sleep 2

if [[ -e "$BASEDIR/covid19_municipios_casos_utfgrid-tiles" ]] || [[ -e "$BASEDIR/covid19_municipios_casos-tiles" ]];then

clear
echo "Os diretorios existem, apagando!"
sleep 2

cd $BASEDIR

rm -rfv covid19_municipios_casos_utfgrid-tiles/

rm -rfv covid19_municipios_casos-tiles/

else
clear
echo "Os diretorios nao existem!"
sleep 2
clear
fi

