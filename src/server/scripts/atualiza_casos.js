const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../config.js')()
var pool = new Pool(config['pg'])

var csvRows = []
var csvFilepath = 'casos.csv'

const lastDateQuery = 'SELECT max(data) AS last_date FROM casos'
const insertRow = 'INSERT INTO casos(cd_geocmu, data, confirmados,suspeitos,descartados,obitos) VALUES($1,$2,$3,$4,$5,$6) RETURNING id'

var replaceView = "CREATE OR REPLACE VIEW municipios_casos AS " +
"SELECT m.nome,m.cd_geocmu,m.estado,m.uf,m.geom,m.area_mun,p.estp_2019 AS pop_2019,c.confirmados,c.data,c.suspeitos,c.descartados,c.obitos" +
"FROM municipios m JOIN populacao p ON m.cd_geocmu::text = p.cd_geocmu::text LEFT JOIN casos c ON m.cd_geocmu::text = c.cd_geocmu::text WHERE m.cd_geocmu::text <> '52'::text AND c.data IS NULL OR c.data = "

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

		    var newLastDate = undefined

		    for(i in csvRows) {
		    	var row = csvRows[i]
				var rowDate = new Date(row.data)

		    	if (rowDate > lastDate) {
			    	
			    	if (newLastDate == undefined || newLastDate < rowDate) {			    		
			    		newLastDate = row.data
					}
					
					if(row.confirmados == "") {row.confirmados = 0}
					if(row.suspeitos == "") {row.suspeitos = 0}
					if(row.descartados == "") {row.descartados = 0}
					if(row.obitos == "") {row.obitos = 0}

			    	var rowValues = [row.cd_geocmu, row.data, row.confirmados, row.suspeitos, row.descartados, row.obitos] 
		  			const res = await client.query(insertRow, rowValues)
		  			console.log(res.rowCount + ' inserted.')
		    	} else {
		    		console.log('Duplicated register ignored.')
		    	}

		    }

		    console.log((newLastDate != undefined), newLastDate)
		    // if (newLastDate != undefined) {
		    // 	await client.query(replaceView + "'" + newLastDate + "'")
		    // 	console.log('View municipios_casos updated')
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