#!/bin/bash

BASESTORAGE='/storage/ows-cache/layers'
BASELOCAL='/data/containers/APP_COVID19/APP/covid19/src/server/scripts/'
DATA=`date +%d-%m-%Y-%H.%M`
DATA02=`date +%d-%m-%Y`

apt-get -y install pv

pip install gspread >> /dev/null

pip3 install pydrive >> /dev/null

cd $BASELOCAL

#Step 0

clear
echo -n -e "Atualizando Planilhas Projections!"
sleep 2

wget 'https://covidgoias.ufg.br/service/indicators/projections?cd_geocmu=5211909&lang=pt-br%27' -O Jatai.txt

wget 'https://covidgoias.ufg.br/service/indicators/projections?cd_geocmu=5218805&lang=pt-br%27' -O RioVerde.txt

wget 'https://covidgoias.ufg.br/service/indicators/projections?cd_geocmu=5213103&lang=pt-br%27' -O Mineiros.txt

python3 upload_googledrive.py


#Step 1
cd $BASELOCAL

clear
echo -n -e "Baixando Planilhas!"
sleep 2

python2 download_planilha_casos.py

rm -rfv 1mlyQIUbGKB2J3UIQrCPxAORaY5HYAPlMgY61IMCu4JY-worksheet0.csv

rm -rfv 163Agr2r4r4evn74SUkVojcdg-hq6urb0qcCMk5Pdknw-worksheet0.csv

mv 1sMzwMlPThQ0-AVYeYAxjkPQ_0G82hOEyDDh-xTlaaf4-worksheet0.csv projecao_casos_go.csv

mv 1LeLPLxMqJMiCq5VQLtjO_e7hPtXWmSZxs5t9-1lYAgU-worksheet0.csv estatisticas.csv

mv 1l_3ZlgEBdd53BZFhGktgzvnuze7s3r0QGwVQomfo1eU-worksheet0.csv bairros_casos.csv

mv 1fO70w9OI1sbRiyHmD9HQZiG_Wa7vqrwpgSigeHRMAD4-worksheet0.csv recuperados.csv


clear
echo -n -e "Planilha baixada com sucesso!"
sleep 2

#Step 2
cd $BASELOCAL

clear
echo -n -e "Populando banco de dados!"
sleep 2

clear
node atualiza_casos_municipios.js
sleep 2
clear
node atualiza_estatisticas.js
sleep 2
clear
node atualiza_projecao.js
sleep 2

clear
node update_recuperados.js
sleep 2

clear
echo -n -e "Guardando Backup no GoogleDrive!"
sleep 2

mv obitos.csv obitos-$DATA02.csv
mv confirmados.csv  confirmados-$DATA02.csv
python3 Upload_Backup_Planilhas.py

#Step 3

clear
echo -n -e "Excluindo Cache!"
sleep 2

if [[ -e "$BASESTORAGE/covid19_municipios_casos_utfgrid-tiles" ]] || [[ -e "$BASESTORAGE/covid19_municipios_casos-tiles" ]];then

clear
echo "Os diretorios existem, apagando!"
sleep 2

ssh -p 2522 root@200.137.217.158 'cd /storage; cd ows-cache/layers/; cd covid19_municipios_casos_utfgrid-tiles/; rm -rfv *'


ssh -p 2522 root@200.137.217.158 'cd /storage; cd ows-cache/layers/; cd covid19_municipios_casos-tiles/; rm -rfv *'

else
clear
echo "Os diretorios nao existem!"
sleep 2
clear
fi

clear
echo "Apagando Rastros!"
sleep 2

cd $BASELOCAL

rm -rfv Jatai.txt RioVerde.txt Mineiros.txt

clear
echo -n -e "Rotina Concluida!"

cd $BASELOCAL

echo "Rotina Concluida em $DATA" >> atualizacao_de_dados.log
