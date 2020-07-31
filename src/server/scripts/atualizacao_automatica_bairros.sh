#!/bin/bash

BASESTORAGE='/data/storage/ows-cache/layers'
BASELOCAL='/data/containers/APP_COVID19/APP/covid19/src/server/scripts/'
START_DATE=`date +%d-%m-%Y-%H.%M.%S`


echo -e "\n\nRotina atualizacao_automatica_bairros.sh iniciada em: $START_DATE" | tee -a /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log

#Script de Atualização de Casos por Bairros.

echo -n -e "\nBaixando Planilhas do GoogleSheets!\n"
sleep 2

cd $BASELOCAL

python2 download_planilha_casos_bairros.py

mv 1l_3ZlgEBdd53BZFhGktgzvnuze7s3r0QGwVQomfo1eU-worksheet0.csv bairros_casos.csv
mv 1H7k1RwWqUCcqkMlr7puEx2bgftsrLk7MwEpXNkuN_F4-worksheet0.csv bairros_obitos.csv

echo -n -e "\nAtualizando O Banco de Dados para Casos!\n"
sleep 2

node atualiza_bairros.js  | tee /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_bairros.log

echo -n -e "\n\n[ Atualizando O Banco de Dados para Óbitos! ] "
sleep 2

node atualiza_bairros_obitos.js  | tee /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_bairros_obitos.log

echo -n -e "\nLimpando Cache dos Dados!\n"
sleep 2


if [ -d $BASESTORAGE/casos_por_bairro_covid-tiles ];then    
       
        echo "Arquivos existem apagando!"
        cd $BASESTORAGE
        cd casos_por_bairro_covid-tiles 
        rm -rfv *
    
else    
        echo "Arquivos nao existem!" 
fi

if [ -d $BASESTORAGE/obitos_por_bairro_covid-tile ];then    
       
        echo "Arquivos existem apagando!" 
        cd $BASESTORAGE
        cd obitos_por_bairro_covid-tiles
        rm -rfv * 
else    
        echo "Arquivos nao existem!" 
fi

clear
echo -n -e "Rotina Concluida!"

clear
END_DATE=`date +%d-%m-%Y-%H.%M.%S`

echo "Rotina atualizacao_automatica_bairros.sh Concluida em $END_DATE" | tee -a  /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log

echo -n "Enviando Mensagem ao Telegram"

SUBJECT="✅ UPDATE atualizacao_automatica_bairros.sh on 200.137.217.159 Server Time : $(date +" %d %b %Y %T")"
UPDATE-COVID19-ALERT

clear
echo -e "LOG DE EXECUÇÃO DA ATUALIZAÇÃO: \n\n"

cat /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log
