const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../config.js')()
var pool = new Pool(config['pg'])

var csvRows = []
var csvFilepath = 'estatisticas.csv'

const lastDateQuery = 'SELECT max(data_inicial) AS last_date FROM estatisticas'
const insertRow = 'INSERT INTO estatisticas(cd_geocmu, nome, data_inicial, total_dias, confirmados, confirmado_inicial, confirmados_novos,media_novos_casos_3dias,taxa_crescimento_confirmados,dias_duplicacao_confirmados) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING gid'

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
				await client.query('TRUNCATE TABLE estatisticas RESTART IDENTITY')

				const lastDateResul = await client.query(lastDateQuery)
				const lastDate = lastDateResul.rows[0]['last_date']

				for (i in csvRows) {
					var row = csvRows[i]
                    var rowDate = new Date(row.data)
                    
                    if(row.taxa_crescimento_confirmados == "NA"){
                        row.taxa_crescimento_confirmados = -1
                    }

                    if(row.dias_duplicacao_confirmados == "NA"){
                        row.dias_duplicacao_confirmados = -1
                    }

					/* for initial population*/
					var rowValues = [row.cd_geocmu, row.nome, row.data_inicial, row.total_dias, row.confirmados,row.confirmado_inicial, row.confirmados_novos, row.media_novos_casos_3dias,row.taxa_crescimento_confirmados,row.dias_duplicacao_confirmados] 
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

				console.log('last update: ', lastDate)

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