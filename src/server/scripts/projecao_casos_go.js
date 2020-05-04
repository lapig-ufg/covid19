const { Pool, Client } = require('pg')
const csv = require('csv-parser');
const fs = require('fs');

var config = require('../config.js')()
var pool = new Pool(config['pg'])

var csvRows = []
var csvFilepath = 'projecao_casos_go.csv'

const truncateQuery = 'TRUNCATE TABLE projecao_casos_go'
const insertRow = 'INSERT INTO projecao_casos_go(data, confirmados, recuperados) VALUES($1,$2,$3) RETURNING id'

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
		    
		    await client.query(truncateQuery)
		    
		    for(i in csvRows) {
		    	var row = csvRows[i]
		    	console.log(row)
		    	var rowValues = [row.data, row.confirmados, row.recuperados] 
	  			const res = await client.query(insertRow, rowValues)
	  			console.log(res.rowCount + ' inserted.')

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