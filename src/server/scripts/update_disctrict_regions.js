const {
    Pool,
    Client
  } = require('pg')
  const csv = require('csv-parser');
  const fs = require('fs');
  
  var config = require('../configScript.js')()
  var pool = new Pool(config['pg'])



var csvRows = []
var csvFilepath = 'regions_bairros.csv'

const insertRow = 'update bairros_municipios set regiao = $1 where id = $2 AND cd_geocmu = $3 RETURNING id'

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

        for (i in csvRows) {
          var row = csvRows[i]

            var rowValues = [row.region, row.id_bairro, row.cd_geocmu]
            const res = await client.query(insertRow, rowValues)
            console.log('new element (' + row.nome_bairro + ') inserted.')
        
        } 

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





