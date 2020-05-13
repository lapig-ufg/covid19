const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../configScript.js')()
var pool = new Pool(config['pg'])

var csvRows = []
var csvFilepath = 'casos.csv'

const lastDateQuery = 'SELECT max(id) as last_id, max(data) AS last_date FROM casos'
const insertRow = 'INSERT INTO casos(cd_geocmu, data, confirmados, suspeitos, obitos, masculino, feminino,menor10, de10a14,	de15a19,	de20a29,	de30a39	,de40a49,	de50a59,	de60a69	,de70a79,	maior80, data_notificacao) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING id'
const dropView = 'DROP VIEW municipios_casos'
var newView = "CREATE OR REPLACE VIEW municipios_casos AS SELECT m.*, p.estp_2019 AS pop_2019, c.confirmados, c.data, c.suspeitos, c.descartados, c.obitos \
FROM municipios m \
  INNER JOIN populacao p ON m.cd_geocmu = p.cd_geocmu \
  LEFT JOIN casos c ON m.cd_geocmu = c.cd_geocmu \
WHERE m.cd_geocmu <> '52'"

fs.createReadStream(csvFilepath)
  .pipe(csv())
  .on('data', (row) => {
    csvRows.push(row)
  })
  .on('end', () => {

    (async () => {

      const client = await pool.connect()
      try {
        await client.query('BEGIN')

        const lastDateResul = await client.query(lastDateQuery)
        const lastDate = new Date(lastDateResul.rows[0]['last_date'])


        var csvRows = [] // receber do Tharles

        for (i in csvRows) {
          var row = csvRows[i]
          var rowDateAtualizacao = new Date(row.dataAtualizacao)

          if (rowDateAtualizacao.getTime() > lastDate.getTime()) {

            if (row.confirmados == '') row.confirmados = null
            if (row.suspeitos == '') row.suspeitos = null
            if (row.obitos == '') row.obitos = null
            if (row.genero.mas == '') row.genero.mas = null
            if (row.genero.fem == '') row.genero.fem = null
            if (row.faixaetaria.menor10 == '') row.faixaetaria.menor10 = null
            if (row.faixaetaria.de10a14 == '') row.faixaetaria.de10a14 = null
            if (row.faixaetaria.de15a19 == '') row.faixaetaria.de15a19 = null
            if (row.faixaetaria.de20a29 == '') row.faixaetaria.de20a29 = null
            if (row.faixaetaria.de30a39 == '') row.faixaetaria.de30a39 = null
            if (row.faixaetaria.de40a49 == '') row.faixaetaria.de40a49 = null
            if (row.faixaetaria.de50a59 == '') row.faixaetaria.de50a59 = null
            if (row.faixaetaria.de60a69 == '') row.faixaetaria.de60a69 = null
            if (row.faixaetaria.de70a79 == '') row.faixaetaria.de70a79 = null
            if (row.faixaetaria.maior80 == '') row.faixaetaria.maior80 = null


            var rowValues = [row.cd_geocmu, row.dataAtualizacao, row.confirmados, row.suspeitos, row.obitos, row.genero.mas, row.genero.fem, 
              row.faixaetaria.menor10, row.faixaetaria.de10a14, row.faixaetaria.de15a19, row.faixaetaria.de20a29, row.faixaetaria.de30a39, 
              row.faixaetaria.de40a49, row.faixaetaria.de50a59, row.faixaetaria.de60a69, row.faixaetaria.de70a79, row.faixaetaria.maior80,
            row.data_notificacao]
            const res = await client.query(insertRow, rowValues)
            console.log(res.rowCount + ' inserted.')
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

  });
