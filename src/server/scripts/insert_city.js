const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../config.js')()
var pool = new Pool(config['pg'])

var csvRows = []
var csvFilepath = 'tmpcity.csv'

const insertRow = 'INSERT INTO temp_nomes(gid, id, nm_bai, nome) VALUES($1,$2,$3,$4) RETURNING gid'

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
				// await client.query('SET datestyle = dmy')
				await client.query('TRUNCATE TABLE temp_nomes RESTART IDENTITY')

				for (i in csvRows) {
					var row = csvRows[i]
                    var rowDate = new Date(row.data)
                    
					/* for initial population*/
					var rowValues = [row.gid, row.id, row.nm_bai, row.nome] 
					const res = await client.query(insertRow, rowValues)

					// if (rowDate > lastDate ) {

                    //     if(row.total_casos == "NA"){
                    //         row_total_casos = -1
                    //     }


					// 	var rowValues = [row.tipo, row.ordem_dia, row.data, row.codigo_municipio, row.municipios, row.total_casos] 
					// 	const res = await client.query(insertRow, rowValues)
						console.log(res.rowCount + ' inserted.')
					// } else  {
					// 	console.log('Duplicated register ignored.')
					// }

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

function toISOFormat(dateTimeString) {

	var date1 = dateTimeString.split('/')
	var newDate = date1[2] + '-' + date1[1] + '-' + date1[0];

	// Retornamos a data formatada em um padrão compatível com ISO:
	return newDate;
}
