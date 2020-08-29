/**
 * @description Read files synchronously from a folder, with natural sorting
 * @param {String} dir Absolute path to directory
 * @returns {Object[]} List of object, each object represent a file
 * structured like so: `{ filepath, name, ext, stat }`
 */

const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
    throw result.error;
}
const { parsed: env } = result;

const fs = require('fs');
const path = require('path');
const moment = require("moment");
const csv = require("csv-parser");
const parse = require('csv-parse/lib/sync');
const fastcsv = require('fast-csv');

var StringBuffer = require("stringbuffer");


const {
    Pool,
    Client
} = require('pg')
const { resolve } = require('app-root-path');

var config = require('../configScript.js')()
var pool = new Pool(config['pg'])

var insertSQLPM = 'INSERT INTO dados_clima(cd_geocmu,nome_municipio,latitude,longitude,aod,pm25,iqa_categoria,temperatura,ur,data_modelo,data_previsao,data_atualizacao,iqa) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING gid'
// var updateSQLTEMP = 'UPDATE dados_clima set temperatura = $1,ur = $2 where cd_geocmu = $3 and data_modelo = $4 AND data_previsao = $5'


var baseFolder = env.CLIMA_FOLDER;
var today = moment()

let month = ''
if (parseInt(today.month()) < 10) {
    month = '0' + (parseInt(today.month()) + 1)
}
else {
    month = parseInt(today.month()) + 1
}
let day = ''
if (parseInt(today.date()) < 10) {
    day = '0' + today.date();
}
else {
    day = today.date();
}
var csvFolderPath = baseFolder + '/Y' + today.year() + '/M' + month + '/D' + day + '/CSV-FILES/'

console.log(csvFolderPath)


var vecPM25 = getPM25();
var vecTEMP = getTEMP_UR();

var tab = unionVecs(vecPM25, vecTEMP);

console.log(tab.length)


saveCSV(tab)
//createSQLFile(tab);
insertDB(tab)

function createSQLFile(table) {
    var sb = new StringBuffer();
    let text = "INSERT INTO dados_clima(cd_geocmu,nome_municipio,latitude,longitude,aod,pm25,iqa_categoria,temperatura,ur,data_modelo,data_previsao,data_atualizacao,iqa) VALUES("
    let fim = ");\n"
    for (ob of table) {

        if (ob.nome_municipio.includes("'")) {
            ob.nome_municipio = ob.nome_municipio.replace("'", "");
        }

        let values = "'" + ob.cd_geocmu + "'," + "'" + ob.nome_municipio + "'," + ob.latitude + "," + ob.longitude + "," + ob.aod + "," + ob.pm25 + ",'" + ob.iqa_categoria + "',"
            + ob.temperatura + "," + ob.ur + "," + "'" + ob.data_modelo + "'," + "'" + ob.data_previsao + "'," + "'" + ob.iqa + "'";
        sb.append(text + values + fim)
    }

    // write to a new file named 2pac.txt
    fs.writeFile(csvFolderPath + '/final/insert.sql', sb.toString(), (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        console.log('CSV saved!');
    });
}


function saveCSV(data) {

    let dir = csvFolderPath + '/final/'

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const ws = fs.createWriteStream(dir + 'test.csv');
    fastcsv.write(data, { headers: true }).pipe(ws);
}

function insertDB(csvRows) {


    (async () => {

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            console.log("Executando insertion.. ")

            for (ob of csvRows) {

                /* for initial population*/
                var rowValues = [ob.cd_geocmu, ob.nome_municipio, ob.latitude, ob.longitude, ob.aod, ob.pm25, ob.iqa_categoria, ob.temperatura, ob.ur, new Date(ob.data_modelo),
                new Date(ob.data_previsao), new Date(ob.data_atualizacao), ob.iqa]
                // console.log(rowValues)
                const res = await client.query(insertSQLPM, rowValues)

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
        console.log('fim')
    }
    )().catch(e => console.error(e.stack))
}

function unionVecs(vecPM25, vecTEMP) {
    let tabela = []
    for (let ob25 of vecPM25) {
        for (let t of vecTEMP) {
            if (ob25.cd_geocmu === t.cd_geocmu && new Date(ob25.data_modelo).getTime() === new Date(t.data_modelo).getTime() &&
                new Date(ob25.data_previsao).getTime() === new Date(t.data_previsao).getTime()) {
                let o = {
                    cd_geocmu: ob25.cd_geocmu,
                    nome_municipio: ob25.nome_municipio.replace("'", ""),
                    latitude: ob25.latitude,
                    longitude: ob25.longitude,
                    aod: ob25.aod,
                    pm25: ob25.pm25,
                    iqa: ob25.iqa,
                    temperatura: t.temperatura,
                    ur: t.ur,
                    data_modelo: ob25.data_modelo,
                    data_previsao: ob25.data_previsao,
                    data_atualizacao: ob25.data_atualizacao,
                    iqa_categoria: ob25.iqa_categoria
                }

                // console.log(o)
                tabela.push(o)
            }
        }
    }

    return tabela;
}


function getPM25() {
    const files = readFilesSync(csvFolderPath, 'PM25');
    // console.log(files)
    var returnVec = []
    for (file of files) {
        // var csvRows = []
        let filepath = file.filepath

        var myMap = fs.readFileSync(filepath, 'utf8');
        const csvRows = parse(myMap, {
            columns: true,
            skip_empty_lines: true
        })

        var name_split = file.name.split('_');

        var str_dataIni = name_split[1] + " " + name_split[4]
        var data_inicial = moment(str_dataIni, "YYYYMMDD HHmm").format('YYYY-MM-DD HH:mm')
        // var data_final = new Date(name_split[2]).format('YYYYMMDD');

        var str_dataFim = name_split[2] + " " + name_split[4]
        var data_final = moment(str_dataFim, "YYYYMMDD HHmm").format('YYYY-MM-DD HH:mm')

        // var data_final = moment(name_split[2], "YYYYMMDD").format('YYYY-MM-DD')
        var data_atualizacao = moment().format('YYYY-MM-DD')

        for (let i in csvRows) {
            var row = csvRows[i]

            var ob = {
                cd_geocmu: row.Geocodigo,
                nome_municipio: row.Municipio,
                latitude: Number(row.Lat),
                longitude: Number(row.Lon),
                aod: Number(row.AOD),
                pm25: Number(row.PM25),
                iqa: Number(row.IQA),
                data_modelo: data_inicial,
                data_previsao: data_final,
                data_atualizacao: data_atualizacao,
                iqa_categoria: row.IQA_Categoria

            };

            returnVec.push(ob)
        }

        // console.log(returnVec)
        // console.log("fim", file.name)
        // console.log("csv - ", csvRows.length)
        // console.log("vec - ", returnVec.length)
    }
    return returnVec;
}

function getTEMP_UR() {
    const files = readFilesSync(csvFolderPath, 'TEMP-UR');
    // console.log(files)
    var returnVec = []
    for (file of files) {
        // var csvRows = []
        let filepath = file.filepath

        var myMap = fs.readFileSync(filepath, 'utf8');
        const csvRows = parse(myMap, {
            columns: true,
            skip_empty_lines: true
        })

        var name_split = file.name.split('_');
        var str_dataIni = name_split[1] + " " + name_split[4]
        var data_inicial = moment(str_dataIni, "YYYYMMDD HHmm").format('YYYY-MM-DD HH:mm')
        // var data_final = new Date(name_split[2]).format('YYYYMMDD');

        var str_dataFim = name_split[2] + " " + name_split[4]
        var data_final = moment(str_dataFim, "YYYYMMDD HHmm").format('YYYY-MM-DD HH:mm')


        for (let i in csvRows) {
            var row = csvRows[i]

            var ob = {
                cd_geocmu: row.Geocodigo,
                nome_municipio: row.Municipio,
                latitude: Number(row.Lat),
                longitude: Number(row.Lon),
                temperatura: Number(row.TEMP),
                ur: Number(row.UR),
                data_modelo: data_inicial,
                data_previsao: data_final,
                iqa_categoria: row.IQA - Categoria
            };

            /* for initial population*/
            // var rowValues = [ob.cd_geocmu, ob.nome_municipio, ob.latitude, ob.longitude, ob.aod, ob.pm25, ob.iqa, data_inicial, data_final, data_atualizacao]
            // console.log(rowValues)
            returnVec.push(ob)
        }

        // console.log(returnVec)
        // console.log("fim", file.name)
        // console.log("csv - ", csvRows.length)
        // console.log("vec - ", returnVec.length)
    }
    return returnVec;
}

function readFilesSync(dir, stringPart) {
    const files = [];

    fs.readdirSync(dir).forEach(filename => {
        const name = path.parse(filename).name;
        const ext = path.parse(filename).ext;
        const filepath = path.resolve(dir, filename);
        const stat = fs.statSync(filepath);
        const isFile = stat.isFile();

        if (isFile) {
            if (ext == '.csv' && name.includes(stringPart))
                files.push({ filepath, name, ext, stat });
        }
    });

    // files.sort((a, b) => {
    //     // natural sort alphanumeric strings
    //     // https://stackoverflow.com/a/38641281
    //     return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    // });

    return files;
}