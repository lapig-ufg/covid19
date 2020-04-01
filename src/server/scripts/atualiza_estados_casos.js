const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../configScript.js')()
var pool = new Pool(config['pg'])

var csvRows = []
var csvFilepath = 'estados_casos.csv'

const lastDateQuery = 'SELECT max(data) AS last_date FROM casos_estados'
const insertRow = 'INSERT INTO casos_estados(ordem_dia, data, cd_geouf,	uf,	obitos,	novos_casos, total_casos) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING gid'

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
				await client.query('SET datestyle = dmy')

				const lastDateResul = await client.query(lastDateQuery)
				const lastDate = lastDateResul.rows[0]['last_date']

				var newLastDate = undefined

				for (i in csvRows) {
					var row = csvRows[i]
					var rowDate = new Date(toISOFormat(row.data))

					/* for initial population*/
					//          var rowValues = [row.ordem_dia, row.data, row.codigo_estadual, row.estados, row.obitos, row.novos_casos, row.total_casos] 
					// const res = await client.query(insertRow, rowValues)

					if (rowDate > lastDate ) {

						if (newLastDate == undefined || newLastDate < rowDate) {
							newLastDate = row.data
						}

						var rowValues = [row.ordem_dia, row.data, row.codigo_estadual, row.estados, row.obitos, row.novos_casos, row.total_casos]
						const res = await client.query(insertRow, rowValues)
						console.log(res.rowCount + ' inserted.')
					} else  {
						console.log('Duplicated register ignored.')
					}

				}

				console.log((newLastDate != undefined), newLastDate)

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

function toISOFormat(dateTimeString) {

	var date1 = dateTimeString.split('/')
	var newDate = date1[2] + '-' + date1[1] + '-' + date1[0];

	// Retornamos a data formatada em um padrão compatível com ISO:
	return newDate;
}