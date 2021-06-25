#!/bin/bash

BASESTORAGE='/data/storage/ows-cache/layers'
BASELOCAL='/data/containers/APP_COVID19/APP/covid19/src/server/scripts'
START_DATE=`date +%d-%m-%Y-%H.%M.%S`

echo -e "\n\nRotina atualizacao_automatica_casos.sh iniciada em: $START_DATE" | tee -a /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log

#Include telegram chat id and bot token ID here and URL variable
chat_id="-427575689"
TOKEN="1370924692:AAFd-MW3vei_24_HkQxcwHPYtKJmKnFT2so"
URL="https://api.telegram.org/bot$TOKEN/sendMessage"

function UPDATE-COVID19-ALERT
{

curl -s -X POST $URL -d chat_id="$chat_id" -d text="$SUBJECT" > /dev/null 2>&1

}

apt-get -y install pv >> /dev/null

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

#Step 2
cd $BASELOCAL

rm -rfv casos_confirmados.csv

rm -rfv obitos_confirmados.csv

cd /data/containers/APP_COVID19/APP/covid19/src/server/scripts

wget http://datasets.saude.go.gov.br/coronavirus/casos_confirmados.csv

cat casos_confirmados.csv | tr ';' ',' > confirmados.csv

cd /data/containers/APP_COVID19/APP/covid19/src/server/scripts

wget http://datasets.saude.go.gov.br/coronavirus/obitos_confirmados.csv

cat obitos_confirmados.csv | tr ';' ',' > obitos.csv

clear
echo -n -e "Populando banco de dados!"
sleep 2

clear
node --max-old-space-size=32000 atualiza_casos_municipios.js | tee /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_casos_municipios.log
sleep 2
clear


clear
echo -n -e "Excluindo Cache!"
sleep 2

if [ -d $BASESTORAGE/covid19_municipios_casos_utfgrid-tiles ];then

        echo "Arquivos existem apagando!"
        cd $BASESTORAGE
        cd covid19_municipios_casos_utfgrid-tiles
        rm -rfv *

else
        echo "Arquivos nao existem!"
fi

if [ -d $BASESTORAGE/covid19_municipios_casos-tiles ];then

        echo "Arquivos existem apagando!"
        cd $BASESTORAGE
        cd covid19_municipios_casos-tiles
        rm -rfv *
else
        echo "Arquivos nao existem!"
fi

clear
echo -n -e "Rotina Concluida!"

cd $BASELOCAL

clear
END_DATE=`date +%d-%m-%Y-%H.%M.%S`
echo "Rotina atualizacao_automatica_casos.sh Concluida em $END_DATE" | tee -a  /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log

echo -n "Enviando Mensagem ao Telegram"
SUBJECT="✅ UPDATE atualizacao_automatica_casos.sh on 200.137.217.159 Server Time : $(date +" %d %b %Y %T")"
UPDATE-COVID19-ALERT

echo -e "LOG DE EXECUÇÃO DA ATUALIZAÇÃO: \n\n"

cat /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log
