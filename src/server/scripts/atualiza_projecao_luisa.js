const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

const moment = require("moment");

var config = require('../configScript.js')()
var pool = new Pool(config['pg'])

var csvRows = []
var csvFilepath = 'projecao_casos_go_luisa.csv'

var csvFilepathStat = 'estatisticas_luisa.csv'
var csvRowsStat = []

const insertRow = 'INSERT INTO projecao_casos_mapa_luisa(ordem_dia, data, cd_geocmu, municipio, confirmados,recuperados,infectados,hospitalizados,leitos,data_atualizacao) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING gid'

const insertStats = 'INSERT INTO estatisticas_luisa(municipio, data_pico_infectados_incidencia, data_pico_infectados_acumudado, R0, taxa_crescimento, n_total_infectadados_pico, cd_geocmu,data_atualizacao) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING gid'

var time = moment().format('YYYY-MM-DD HH:mm')


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
                await client.query('TRUNCATE TABLE projecao_casos_mapa_luisa RESTART IDENTITY')
                
                
				for (i in csvRows) {
					var row = csvRows[i]
                    
					/* for initial population*/
					var rowValues = [row.ordem_dia, row.data, row.cd_geocmu, row.localidade, row.casos_conf, row.recuperados, row.infectados, row.hospitalizados, row.leitos, time] 
					const res = await client.query(insertRow, rowValues)

					console.log(row.localidade + ' inserted.')

				}

                console.log('END INSERT PROJECTIONS: ')
                
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
    


fs.createReadStream(csvFilepathStat)
.pipe(csv())
.on('data', (row) => {
    csvRowsStat.push(row)
})
.on('end', () => {

    (async () => {

        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            // await client.query('SET datestyle = dmy')
            await client.query('TRUNCATE TABLE estatisticas_luisa RESTART IDENTITY')
            
            for (i in csvRowsStat) {
                var row = csvRowsStat[i]
                
                /* for initial population*/
                var rowValues = [row.municipios, row.data_pico_infectados_incidencia, row.data_pico_infectados_acumudado, row.R0, row.Taxa_Crescimento, row.N_total_infectados_pico, row.cd_geocmu, time] 
                const res = await client.query(insertStats, rowValues)

                console.log(row.municipios + ' inserted.')

            }

            console.log('END INSERT STATISTICS: ')
            
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