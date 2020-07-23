#!/bin/bash

BASESTORAGE='/data/storage/ows-cache/layers'
BASELOCAL='/data/containers/APP_COVID19/APP/covid19/src/server/scripts'
DATA=`date +%d-%m-%Y-%H.%M`
DATA02=`date +%d-%m-%Y`

apt-get -y install pv

pip install gspread >> /dev/null

pip3 install pydrive >> /dev/null

cd $BASELOCAL


#Step 1
cd $BASELOCAL

clear
echo -n -e "Baixando Planilhas!"
sleep 2

python2 download_planilha_casos.py

mv 1sMzwMlPThQ0-AVYeYAxjkPQ_0G82hOEyDDh-xTlaaf4-worksheet0.csv projecao_casos_go.csv

mv 1LeLPLxMqJMiCq5VQLtjO_e7hPtXWmSZxs5t9-1lYAgU-worksheet0.csv estatisticas.csv

mv 1l_3ZlgEBdd53BZFhGktgzvnuze7s3r0QGwVQomfo1eU-worksheet0.csv bairros_casos.csv

mv 1fO70w9OI1sbRiyHmD9HQZiG_Wa7vqrwpgSigeHRMAD4-worksheet0.csv recuperados.csv

mv 1ELlIaPqgSZubGQOJy1pXVQa60Az9YfjAfPZ1UeiKseY-worksheet0.csv estatisticas_luisa.csv

mv 1x9zk22gE8p8suaqfdtm3rPLGHvxEIN8mMCU2Mn7XTkI-worksheet0.csv projecao_casos_go_luisa.csv

mv 1I2pc2g1ciqlua5fH-SKpwxIzssgY-bjeqmxcPZpwWqs-worksheet0.csv medias_moveis.csv


clear
echo -n -e "Planilha baixada com sucesso!"
sleep 2

#Step 2
cd $BASELOCAL

clear
echo -n -e "Populando banco de dados!"
sleep 2

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

clear
echo -n -e "Excluindo Cache!"
sleep 2



if [ -d $BASESTORAGE/projecao_luisa_confirmados-tile ];then    
       
        echo "Arquivos existem apagando!"
        cd $BASESTORAGE
        cd projecao_luisa_confirmados-tile
        rm -rfv *
    
else	
        echo "Arquivos nao existem!" 
fi

if [ -d $BASESTORAGE/projecao_luisa_hospitalizados-tiles ];then    
       
        echo "Arquivos existem apagando!" 
    	cd $BASESTORAGE
    	cd projecao_luisa_hospitalizados-tiles
    	rm -rfv * 
else	
        echo "Arquivos nao existem!" 
fi

if [ -d $BASESTORAGE/projecao_luisa_infectados-tiles ];then    
       
        echo "Arquivos existem apagando!"
        cd $BASESTORAGE
        cd projecao_luisa_infectados-tiles 
        rm -rfv *
    
else	
        echo "Arquivos nao existem!" 
fi

if [ -d $BASESTORAGE/projecao_luisa_recuperados-tiles];then    
       
        echo "Arquivos existem apagando!" 
    	cd $BASESTORAGE
    	cd projecao_luisa_recuperados-tiles
    	rm -rfv * 
else	
        echo "Arquivos nao existem!" 
fi

if [ -d $BASESTORAGE/covid_medias_moveis-tiles ];then    
       
        echo "Arquivos existem apagando!" 
    	cd $BASESTORAGE
    	cd covid_medias_moveis-tiles
    	rm -rfv * 
else	
        echo "Arquivos nao existem!" 
fi


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
