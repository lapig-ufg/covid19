const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../configScript.js')()
var pool = new Pool(config['pg'])

var csvRows = []
var csvFilepath = 'recuperados.csv'

const updateQuery = "UPDATE casos set recuperados = $1 where cd_geocmu = $2 and date(data) = $3"

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
                    
					var rowValues = [row.recuperados, row.cd_geocmu, row.data] 
					const res = await client.query(updateQuery, rowValues)

					console.log(row.data + ' inserted.')

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