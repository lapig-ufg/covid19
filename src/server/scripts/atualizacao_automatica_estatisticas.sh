#!/bin/bash

BASESTORAGE='/data/storage/ows-cache/layers'
BASELOCAL='/data/containers/APP_COVID19/APP/covid19/src/server/scripts'
START_DATE=`date +%d-%m-%Y-%H.%M.%S`

echo -e "\n\nRotina atualizacao_automatica_estatisticas.sh iniciada em: $START_DATE" | tee -a /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log


function UPDATE-COVID19-ALERT
{
#Include telegram chat id and bot token ID here and URL variable
source ../.env
chat_id="$chat_id"
TOKEN="$token"
URL="https://api.telegram.org/bot$TOKEN/sendMessage"

curl --silent --output /dev/null  "https://api.telegram.org/bot$TOKEN/sendMessage?chat_id=$chat_id&text=$SUBJECT" > /dev/null 
}

apt-get -y install pv >> /dev/null

pip install gspread >> /dev/null

pip3 install pydrive >> /dev/null

cd $BASELOCAL


#Step 1
cd $BASELOCAL

clear
echo -n -e "Baixando Planilhas!"
sleep 2

python2 download_planilha_estatisticas.py

# mv 1uCWUVbEaI8kQvQCuwsAGXuHc-Y8Ab_ottunsz3ib6M0-worksheet0.csv projecao_casos_go.csv 

# mv 17MUnurVVXmhcwJwRA0cV1L83zm7pMbat0jljKnESEI0-worksheet0.csv estatisticas.csv 

mv 1fO70w9OI1sbRiyHmD9HQZiG_Wa7vqrwpgSigeHRMAD4-worksheet0.csv recuperados.csv 

# mv 1x9zk22gE8p8suaqfdtm3rPLGHvxEIN8mMCU2Mn7XTkI-worksheet0.csv projecao_casos_go_luisa.csv 

# mv 1ELlIaPqgSZubGQOJy1pXVQa60Az9YfjAfPZ1UeiKseY-worksheet0.csv estatisticas_luisa.csv

# mv 1wa6WKm2amGY47Klz5oedttvWpTPew2LbbbHwYKF2tds-worksheet0.csv medias_moveis.csv 

cp -rvp /data/projetos/planilhas_covid_bauman/*.csv $BASELOCAL

mv tabela_prev_casos_conf_municipios.csv projecao_casos_go.csv

mv tabela_estatistica_municipios.csv estatisticas.csv

mv tabela_prev_mod_logistico_luisa_adaptado.csv projecao_casos_go_luisa.csv

mv tabela_estatisticas_mod_logistico_luisa_adaptado.csv estatisticas_luisa.csv

mv dados_MM7_novos_casos.csv medias_moveis.csv

mv dados_MM7_novos_obitos.csv medias_moveis_obitos.csv

clear
echo -n -e "Planilha baixada com sucesso!"
sleep 2

#Step 2
cd $BASELOCAL

clear
echo -n -e "Populando banco de dados!"
sleep 2

node atualiza_estatisticas.js | tee /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_estatisticas.log
sleep 2
clear
node atualiza_projecao.js | tee  /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_projecao.log
sleep 2
clear
node update_recuperados.js | tee /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/update_recuperados.log
sleep 2
clear
node atualiza_projecao_luisa.js | tee  /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_projecao_luisa.log
sleep 2
clear
node atualiza_estatisticas_luisa.js | tee  /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_estatisticas_luisa.log
sleep 2
clear
node atualiza_medias_moveis.js | tee  /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_medias_moveis.log
sleep 2
clear
node atualiza_medias_moveis_obitos.js | tee /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualiza_medias_moveis_obitos.log
sleep 2
clear

clear
echo -n -e "Excluindo Cache!"
sleep 2



if [ -d $BASESTORAGE/projecao_luisa_confirmados-tiles ];then

        echo "Arquivos existem apagando!"
        cd $BASESTORAGE
        cd projecao_luisa_confirmados-tiles
        rm -rfv *

else
        echo "Arquivos projecao_luisa_confirmados-tile nao existem!"
fi

if [ -d $BASESTORAGE/projecao_luisa_hospitalizados-tiles ];then

        echo "Arquivos existem apagando!"
        cd $BASESTORAGE
        cd projecao_luisa_hospitalizados-tiles
        rm -rfv *
else
        echo "Arquivos projecao_luisa_hospitalizados-tiles nao existem!"
fi

if [ -d $BASESTORAGE/projecao_luisa_infectados-tiles ];then

        echo "Arquivos existem apagando!"
        cd $BASESTORAGE
        cd projecao_luisa_infectados-tiles
        rm -rfv *

else
        echo "Arquivos  projecao_luisa_infectados-tiles nao existem!"
fi

if [ -d $BASESTORAGE/projecao_luisa_recuperados-tiles];then

      echo "Arquivos existem apagando!"
        cd $BASESTORAGE
        cd projecao_luisa_recuperados-tiles
        rm -rfv *
else
        echo "Arquivos projecao_luisa_recuperados-tiles nao existem!"
fi

if [ -d $BASESTORAGE/covid_medias_moveis-tiles ];then

        echo "Arquivos existem apagando!"
        cd $BASESTORAGE
        cd covid_medias_moveis-tiles
        rm -rfv *
else
        echo "Arquivos covid_medias_moveis-tiles nao existem!"
fi

if [ -d $BASESTORAGE/covid_medias_moveis_obitos-tiles];then

        echo "Arquivos existem apagando!"
        cd $BASESTORAGE
        cd covid_medias_moveis_obitos-tiles
        rm -rfv *
else
        echo "Arquivos covid_medias_moveis-tiles nao existem!"
fi


clear
echo -n -e "Rotina Concluida!"

clear
END_DATE=`date +%d-%m-%Y-%H.%M.%S`
echo "Rotina atualizacao_automatica_estatisticas.sh Concluida em $END_DATE" | tee -a  /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log

echo -n "Enviando Mensagem ao Telegram"

SUBJECT="✅ UPDATE atualizacao_automatica_estatisticas.sh on 200.137.217.159 Server Time : $(date +" %d %b %Y %T")"
UPDATE-COVID19-ALERT

clear
echo -e "LOG DE EXECUÇÃO DA ATUALIZAÇÃO: \n\n"

cat /data/containers/APP_COVID19/APP/covid19/src/server/scripts/logs/atualizacao_de_dados.log
