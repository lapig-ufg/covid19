const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../configScript.js')()
var pool = new Pool(config['pg'])

var csvRows = []
var csvFilepath = 'casos.csv'

const lastDateQuery = 'SELECT max(id) as last_id, max(data) AS last_date FROM casos'
const insertRow = 'INSERT INTO casos(cd_geocmu, data, confirmados, suspeitos, obitos) VALUES($1,$2,$3,$4,$5) RETURNING id'
const dropView = 'DROP VIEW municipios_casos'
var newView = "CREATE OR REPLACE VIEW municipios_casos AS SELECT m.*, p.estp_2019 AS pop_2019, c.confirmados, c.data, c.suspeitos, c.descartados, c.obitos \
FROM municipios m \
  INNER JOIN populacao p ON m.cd_geocmu = p.cd_geocmu \
  LEFT JOIN casos c ON m.cd_geocmu = c.cd_geocmu \
WHERE m.cd_geocmu <> '52' AND c.data IS NULL OR c.data = "

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
			const lastDate = lastDateResul.rows[0]['last_date']
			const lastid = lastDateResul.rows[0]['last_id']
			

            var newLastDate = undefined

            for(i in csvRows) {
                var row = csvRows[i]
				var rowDate = new Date(row.data)
				var rowID = new Number(row.id);

                if (rowDate > lastDate || rowID > lastid) {
                    
                    if (newLastDate == undefined || new Date(newLastDate).getTime() < rowDate.getTime()) {                        
                        newLastDate = row.data
					}
					
					if(row.confirmados == '') row.confirmados = null
					if(row.suspeitos == '') row.suspeitos = null
					if(row.obitos == '') row.obitos = null

                    var rowValues = [row.cd_geocmu, row.data, row.confirmados, row.suspeitos, row.obitos] 
                    const res = await client.query(insertRow, rowValues)
                    console.log(res.rowCount + ' inserted.')
                } else {
                    console.log('Duplicated register ignored.')
                }

            }

            console.log((newLastDate != undefined), newLastDate)
            if (newLastDate != undefined) {
                await client.query(dropView)
                await client.query(newView + "'" + newLastDate + "'")
                console.log('View municipios_casos updated')
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
