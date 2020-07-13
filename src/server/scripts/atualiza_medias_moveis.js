const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../configScript.js')()
var pool = new Pool(config['pg'])

var csvRows = []
var csvFilepath = 'medias_moveis.csv'

const lastDateQuery = 'SELECT max(data) AS last_date FROM medias_moveis'
const insertRow = 'INSERT INTO medias_moveis(cd_geocmu,data,ordem_dia,localidade,novos_casos,mm7,variacao_per_mm7_14dias,tendencia_novos_casos) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING gid'

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
				await client.query('TRUNCATE TABLE medias_moveis RESTART IDENTITY')

				const lastDateResul = await client.query(lastDateQuery)
				const lastDate = lastDateResul.rows[0]['last_date']

				for (i in csvRows) {
					var row = csvRows[i]
                    var rowDate = new Date(row.data)

					row.variacao_per_MM7_14dias = row.variacao_per_MM7_14dias.replace(/,/g, '.');
					row.MM7 = row.MM7.replace(/,/g, '.');
					row.tendencia_novos_casos = row.tendencia_novos_casos.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

                    if(row.novos_casos == "NA" || row.novos_casos == ""){
                        row.novos_casos = null
                    }

                    if(row.MM7 == "NA" || row.MM7 == ""){
                        row.MM7 = null
                    }

					if(row.variacao_per_MM7_14dias == "NA" || row.variacao_per_MM7_14dias == "" || row.variacao_per_MM7_14dias == "-Inf"){
						row.variacao_per_MM7_14dias = null
					}

					if(row.tendencia_novos_casos == "NA" || row.tendencia_novos_casos == ""){
						row.tendencia_novos_casos = 'sem_registro'
					}

					/* for initial population*/
					var rowValues = [row.cd_geocmu, row.data, row.ordem_dia,row.localidade, row.novos_casos, row.MM7, row.variacao_per_MM7_14dias, row.tendencia_novos_casos]
					const res = await client.query(insertRow, rowValues)

					// if (rowDate > lastDate ) {

                    //     if(row.total_casos == "NA"){
                    //         row_total_casos = -1
                    //     }


					// 	var rowValues = [row.tipo, row.ordem_dia, row.data, row.codigo_municipio, row.municipios, row.total_casos]
					// 	const res = await client.query(insertRow, rowValues)
						console.log(row.localidade + ' inserted.')
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
