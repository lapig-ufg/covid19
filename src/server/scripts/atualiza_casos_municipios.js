const Update = require('./update');


const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../configScript.js')()
var pool = new Pool(config['pg'])



const lastDateQuery = 'SELECT max(id) as last_id, max(data) AS last_date FROM casos'
const insertRow = 'INSERT INTO casos(cd_geocmu, data, confirmados, suspeitos, obitos, masculino, feminino,menor10, de10a14,	de15a19,	de20a29,	de30a39	,de40a49,	de50a59,	de60a69	,de70a79,	maior80, municipio, recuperados ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING id'
const insertObitos = 'INSERT INTO obitos_stats(cd_geocmu, data, obitos, masculino, feminino,menor10, de10a14,	de15a19,	de20a29,	de30a39	,de40a49,	de50a59,	de60a69	,de70a79,	maior80 , municipio) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING gid'
const updateCdGeo = 'update casos set cd_geocmu = m.cd_geocmu from municipios m where casos.cd_geocmu = SUBSTRING (m.cd_geocmu FROM 1 FOR 6) and data = (select max(data) from casos)'


const update = new Update();

update.up(foo);

function foo(dados) {
    console.log(dados);

    let sum = 0;
    dados.forEach(function (item, index) {
        if(item.cd_geocmu != 111 && item.cd_geocmu != 5300108){
            sum+= item.confirmados;
        }
    });

    console.log("TOTAL CONFIRMADOS: ", sum);


    (async () => {

        const client = await pool.connect()
        try {
          await client.query('BEGIN')

          const lastDateResul = await client.query(lastDateQuery)
          const lastDate = new Date(lastDateResul.rows[0]['last_date'])

          var csvRows = dados // receber do Tharles

          for (i in csvRows) {
            var row = csvRows[i]
            var rowDateAtualizacao = new Date(row.data)

            if (rowDateAtualizacao.getTime() > lastDate.getTime()) {

              if (row.confirmados == '') row.confirmados = null
              if (row.suspeitos == '') row.suspeitos = null
              if (row.obitos == '') row.obitos = null
              if (row.masculino == '') row.masculino = null
              if (row.feminino == '') row.feminino = null
              if (row.menor10 == '') row.menor10 = null
              if (row.de10a14 == '') row.de10a14 = null
              if (row.de15a19 == '') row.de15a19 = null
              if (row.de20a29 == '') row.de20a29 = null
              if (row.de30a39 == '') row.de30a39 = null
              if (row.de40a49 == '') row.de40a49 = null
              if (row.de50a59 == '') row.de50a59 = null
              if (row.de60a69 == '') row.de60a69 = null
              if (row.de70a79 == '') row.de70a79 = null
              if (row.maior80 == '') row.maior80 = null
              if (row.municipio == '') row.municipio = null
              if (row.recuperados == '') row.recuperados = null

              if (row.masculino_obitos == '') row.masculino_obitos = null
              if (row.feminino_obitos == '') row.feminino_obitos = null
              if (row.menor10_obitos == '') row.menor10_obitos = null
              if (row.de10a14_obitos == '') row.de10a14_obitos = null
              if (row.de15a19_obitos == '') row.de15a19_obitos = null
              if (row.de20a29_obitos == '') row.de20a29_obitos = null
              if (row.de30a39_obitos == '') row.de30a39_obitos = null
              if (row.de40a49_obitos == '') row.de40a49_obitos = null
              if (row.de50a59_obitos == '') row.de50a59_obitos = null
              if (row.de60a69_obitos == '') row.de60a69_obitos = null
              if (row.de70a79_obitos == '') row.de70a79_obitos = null
              if (row.maior80_obitos == '') row.maior80_obitos = null


              var rowValues = [row.cd_geocmu, row.data, row.confirmados, row.suspeitos, row.obitos, row.masculino, row.feminino,
                row.menor10, row.de10a14, row.de15a19, row.de20a29, row.de30a39,
                row.de40a49, row.de50a59, row.de60a69, row.de70a79, row.maior80 , row.municipio,  row.recuperados]

                var rowObitos = [row.cd_geocmu, row.data, row.obitos, row.masculino_obitos, row.feminino_obitos,
                    row.menor10_obitos, row.de10a14_obitos, row.de15a19_obitos, row.de20a29_obitos, row.de30a39_obitos,
                    row.de40a49_obitos, row.de50a59_obitos, row.de60a69_obitos, row.de70a79_obitos, row.maior80_obitos, row.municipio]

              const res = await client.query(insertRow, rowValues)

              const res2 = await client.query(insertObitos, rowObitos)


              console.log(row.municipio + ' inserted.')
            } else {
              console.log('Duplicated register ignored.')
            }

            // if (newLastDate == undefined || new Date(newLastDate).getTime() < rowDate.getTime()) {
            //   newLastDate = row.data
            // }

          }


          console.log('last update: ', lastDate)

          // if (newLastDate != undefined) {
          //   await client.query(dropView)
          //   await client.query(newView)
          //   console.log('View municipios_casos updated')
          // }

          const res3 = await client.query(updateCdGeo, [])

          console.log("Doing commit")
          await client.query('COMMIT')

        } catch (e) {
          console.log("Doing rollback")
          await client.query('ROLLBACK')
          throw e
        } finally {
          client.release()
        }
      })().catch(e => console.error(e.stack))



}

