#!/bin/bash

BASESTORAGE='/data/storage/ows-cache/layers'
BASELOCAL='/data/containers/APP_COVID19/APP/covid19/src/server/scripts'
DATA=`date +%d-%m-%Y-%H.%M`
DATA02=`date +%d-%m-%Y`

#Include telegram chat id and bot token ID here
chat_id="-427575689"
TOKEN="1370924692:AAFd-MW3vei_24_HkQxcwHPYtKJmKnFT2so"

function UPDATE-COVID19-ALERT
{
curl --silent --output /dev/null  "https://api.telegram.org/bot$TOKEN/sendMessage?chat_id=$chat_id&text=$SUBJECT" > /dev/null 
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

clear
echo -n -e "Populando banco de dados!"
sleep 2

clear
node atualiza_casos_municipios.js | tee /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_casos_municipios.log
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
echo "Apagando Rastros!"
sleep 2

cd $BASELOCAL
rm -rfv *.csv

clear
echo -n -e "Rotina Concluida!"

cd $BASELOCAL

echo -e "\n\n Rotina atualizacao_automatica_casos.sh Concluida em $DATA \n\n" >> /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log

echo -n "Enviando Mensagem ao Telegram"

SUBJECT="✅ UPDATE atualizacao_automatica_casos.sh on 200.137.217.159 Server Time : $(date +" %d %b %Y %T")"
UPDATE-COVID19-ALERT

clear
echo -e "LOG DE EXECUÇÃO DA ATUALIZAÇÃO: \n\n"

cat /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log
