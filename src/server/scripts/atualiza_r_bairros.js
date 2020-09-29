const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

const moment = require("moment");

var config = require('../configScript.js')()
var pool = new Pool(config['pg'])

var csvFilepathStat = 'r_bairros.csv'
var csvRowsStat = []


const insertStats = 'INSERT INTO r_bairros(id_bairro, r_value, data_atualizacao) VALUES ($1,$2,$3) RETURNING gid'

var time = moment().format('YYYY-MM-DD')

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
                // await client.query('TRUNCATE TABLE r_bairros RESTART IDENTITY')

                for (i in csvRowsStat) {
                    var row = csvRowsStat[i]

                    row.R_Bairros = Number(row.R_Bairros.replace(',', '.'))
                    /* for initial population*/
                    var rowValues = [row.IdBairro, row.R_Bairros, time]
                    const res = await client.query(insertStats, rowValues)

                    console.log(row.IdBairro + ' inserted.')

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