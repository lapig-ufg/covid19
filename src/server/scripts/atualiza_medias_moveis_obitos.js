const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../configScript.js')()
var pool = new Pool(config['pg'])

var csvRows = []
var csvFilepath = 'medias_moveis_obitos.csv'

const insertRow = 'INSERT INTO medias_moveis_obitos(cd_geocmu,data,ordem_dia,localidade,novos_obitos,mm7,variacao_per_mm7_14dias,tendencia_novos_obitos) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING gid'

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
				await client.query('TRUNCATE TABLE medias_moveis_obitos RESTART IDENTITY')

				for (i in csvRows) {
					var row = csvRows[i]
					var rowDate = new Date(row.data)

					row.variacao_per_MM7_14dias = row.variacao_per_MM7_14dias.replace(/,/g, '.');
					row.MM7 = row.MM7.replace(/,/g, '.');
					row.tendencia_novos_obitos = row.tendencia_novos_obitos.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

					if (row.novos_obitos == "NA" || row.novos_obitos == "") {
						row.novos_obitos = null
					}

					if (row.MM7 == "NA" || row.MM7 == "") {
						row.MM7 = null
					}

					if (row.variacao_per_MM7_14dias == "NA" || row.variacao_per_MM7_14dias == "" || row.variacao_per_MM7_14dias == "-Inf") {
						row.variacao_per_MM7_14dias = null
					}

					if (row.tendencia_novos_obitos == "NA" || row.tendencia_novos_obitos == "") {
						row.tendencia_novos_obitos = 'sem_registro'
					}

					/* for initial population*/
					var rowValues = [row.cd_geocmu, row.data, row.ordem_dia, row.localidade, row.novos_obitos, row.MM7, row.variacao_per_MM7_14dias, row.tendencia_novos_obitos]
					const res = await client.query(insertRow, rowValues)

					// console.log(row.localidade + ' inserted.')
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
