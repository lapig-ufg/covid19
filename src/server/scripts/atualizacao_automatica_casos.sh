#!/bin/bash

BASESTORAGE='/storage/ows-cache/layers'
BASELOCAL='/data/containers/APP_COVID19/APP/covid19/src/server/scripts'
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

mv 1ELlIaPqgSZubGQOJy1pXVQa60Az9YfjAfPZ1UeiKseY-worksheet0.csv estatisticas_luisa.csv

mv 1x9zk22gE8p8suaqfdtm3rPLGHvxEIN8mMCU2Mn7XTkI-worksheet0.csv projecao_casos_go_luisa.csv

mv 1I2pc2g1ciqlua5fH-SKpwxIzssgY-bjeqmxcPZpwWqs-worksheet0.csv medias_moveis.csv

rm -rfv 1mlyQIUbGKB2J3UIQrCPxAORaY5HYAPlMgY61IMCu4JY-worksheet1.csv

clear
echo -n -e "Planilha baixada com sucesso!"
sleep 2

#Step 2
cd $BASELOCAL

clear
echo -n -e "Populando banco de dados!"
sleep 2

clear
node atualiza_casos_municipios.js > /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_casos_municipios.log
sleep 2
clear
node atualiza_estatisticas.js > /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_estatisticas.log
sleep 2
clear
node atualiza_projecao.js > /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_projecao.log
sleep 2
clear
node update_recuperados.js > /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/update_recuperados.log
sleep 2
clear
node atualiza_projecao_luisa.js > /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_projecao_luisa.log
sleep 2
clear
node atualiza_estatisticas_luisa.js > /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_estatisticas_luisa.log
sleep 2
clear
node atualiza_medias_moveis.js > /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_medias_moveis.log
sleep 2
clear

# echo -n -e "Guardando Backup no GoogleDrive!"
# sleep 2

# mv obitos.csv obitos-$DATA02.csv
# mv confirmados.csv  confirmados-$DATA02.csv
# python3 Upload_Backup_Planilhas.py

#Step 3

clear
echo -n -e "Excluindo Cache!"
sleep 2

cd $BASESTORAGE
cd covid19_municipios_casos_utfgrid-tiles
rm -rfv *
cd $BASESTORAGE
cd covid19_municipios_casos-tiles
rm -rfv *
cd $BASESTORAGE
cd projecao_luisa_confirmados-tile
rm -rfv *
cd $BASESTORAGE
cd projecao_luisa_hospitalizados-tiles
rm -rfv *
cd $BASESTORAGE
cd projecao_luisa_infectados-tiles
rm -rfv *
cd $BASESTORAGE
cd projecao_luisa_recuperados-tiles
rm -rfv *
cd $BASESTORAGE
cd covid_medias_moveis-tiles
rm -rfv *


# if [[ -e "$BASESTORAGE/covid19_municipios_casos_utfgrid-tiles" ]] || [[ -e "$BASESTORAGE/covid19_municipios_casos-tiles" ]] || [[ -e "$BASESTORAGE/projecao_luisa_confirmados-tiles" ]] || [[ -e "$BASESTORAGE/projecao_luisa_hospitalizados-tiles" ]] || [[ -e "$BASESTORAGE/projecao_luisa_infectados-tiles" ]] || [[ -e "$BASESTORAGE/projecao_luisa_recuperados-tiles" ]];then

# clear
# echo "Os diretorios existem, apagando!"
# sleep 2

# cd $BASESTORAGE/covid19_municipios_casos_utfgrid-tiles
# rm -rfv *
# cd $BASESTORAGE/covid19_municipios_casos-tiles
# rm -rfv *
# cd $BASESTORAGE/projecao_luisa_confirmados-tile
# rm -rfv *
# cd $BASESTORAGE/projecao_luisa_hospitalizados-tiles
# rm -rfv *
# cd $BASESTORAGE/projecao_luisa_infectados-tiles
# rm -rfv *
# cd $BASESTORAGE/projecao_luisa_recuperados-tiles
# rm -rfv *
# cd $BASESTORAGE/covid_medias_moveis-tiles
# rm -rfv *

# else
# clear
# echo "Os diretorios nao existem!"
# sleep 2
# clear
# fi

clear
echo "Apagando Rastros!"
sleep 2

cd $BASELOCAL

clear
echo -n -e "Rotina Concluida!"

cd $BASELOCAL

echo -e "LOG DE EXECUÇÃO DA ATUALIZAÇÃO/n/n"

cat /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log

echo -e "Rotina Concluida em $DATA/n/n" >> /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log
