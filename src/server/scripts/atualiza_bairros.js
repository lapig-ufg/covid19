const {
  Pool,
  Client
} = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../configScript.js')()
var pool = new Pool(config['pg'])


var csvRows = []
var csvFilepath = 'bairros_casos.csv'

const lastDateQuery = 'SELECT max(data_ultima_atualizacao) AS last_date FROM casos_por_bairro_em_municipios where cd_geocmu = $1'
const insertRow = 'INSERT INTO casos_por_bairro_em_municipios(id_bairro,cd_geocmu,nome_bairro,numpoints,fonte,data_ultima_atualizacao) VALUES($1,$2,$3,$4,$5,$6) RETURNING id_bairro'


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

        var newLastDate = undefined

        for (i in csvRows) {
          var row = csvRows[i]
          var rowDate = new Date(row.data_atualizacao)

          var rowCdGEO = [row.cd_geocmu]

          var lastDateResul = await client.query(lastDateQuery, rowCdGEO)
          var lastDate = new Date(formatDate(lastDateResul.rows[0]['last_date']))


          console.log("laaaaaaast date - ", lastDate.getTime(), " comp - ", rowDate.getTime())

          // if (lastDate === null || lastDate.getTime() === rowDate.getTime()) {

          if (lastDate === null) {

            var rowValues = [row.id_bairro, row.cd_geocmu, row.nome_bairro, row.numpoints, row.fonte, row.data_atualizacao]
            const res = await client.query(insertRow, rowValues)
            console.log('new element ' + row.nome_bairro + ' inserted.')

          } else {

            if (rowDate > lastDate) {

              var rowValues = [row.id_bairro, row.cd_geocmu, row.nome_bairro, row.numpoints, row.fonte, row.data_atualizacao]
              const res = await client.query(insertRow, rowValues)
              console.log('update ' + row.nome_bairro + ' inserted.')
            } else {
              console.log('Duplicated register ignored.')
            }

            if (newLastDate == undefined || new Date(newLastDate).getTime() < rowDate.getTime()) {
              newLastDate = row.data
            }
          }
        }
        console.log('last date update: ', lastDate)


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

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}