const fs = require("fs");
const path = require("path");
const async = require('async')
const moment = require("moment");

const { Pool, Client } = require("pg");
const csv = require("csv-parser");
const { resolve } = require("app-root-path");

var config = require("../configScript.js")();
var pool = new Pool(config["pg"]);

var csvFolderPath = "/home/luizmlpascoal/Downloads/datdpos/dados-test";

var insertSQLPM =
  "INSERT INTO dados_clima(cd_geocmu,nome_municipio,latitude,longitude,aod,pm25,iqa,data_modelo,data_previsao,data_atualizacao) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING gid";
var updateSQLTEMP =
  "UPDATE dados_clima set temperatura = $1,ur = $2 where cd_geocmu = $3 and data_modelo = $4 AND data_previsao = $5";

readFiles(csvFolderPath, processFile);

function processFile(filepath, name, ext, stat) {
  // console.log('file path:', filepath);
  // console.log('file name:', name);
  // console.log('file extension:', ext);
  // console.log('file information:', stat);

  if (ext == ".csv") {
    var name_split = name.split("_");
    var csvRows = [];

    if (name.includes("PM25")) {
      fs.createReadStream(filepath)
        .pipe(csv())
        .on("data", (row) => {
          csvRows.push(row);
        })
        .on("end", async () => {
          console.log("Executando .. " + filepath);
          (async () => {

            const client = await pool.connect();
            try {
              await client.query("BEGIN");

              // var data_inicial = new Date(name_split[1])
              var str_dataIni = name_split[1] + " " + name_split[4];
              var data_inicial = moment(
                str_dataIni,
                "YYYYMMDD HHmm"
              ).format("YYYY-MM-DD hh:mm");
              // var data_final = new Date(name_split[2]).format('YYYYMMDD');

              var str_dataFim = name_split[2] + " " + name_split[4];
              var data_final = moment(
                str_dataFim,
                "YYYYMMDD HHmm"
              ).format("YYYY-MM-DD hh:mm");

              // var data_final = moment(name_split[2], "YYYYMMDD").format('YYYY-MM-DD')
              var data_atualizacao = moment().format("YYYY-MM-DD");

              for (i in csvRows) {
                var row = csvRows[i];

                var ob = {
                  cd_geocmu: row.Geocodigo,
                  nome_municipio: row.Municipio,
                  latitude: Number(row.Lat),
                  longitude: Number(row.Lon),
                  aod: Number(row.AOD),
                  pm25: Number(row.PM25),
                  iqa: row.IQA,
                };

                /* for initial population*/
                var rowValues = [
                  ob.cd_geocmu,
                  ob.nome_municipio,
                  ob.latitude,
                  ob.longitude,
                  ob.aod,
                  ob.pm25,
                  ob.iqa,
                  data_inicial,
                  data_final,
                  data_atualizacao,
                ];
                // console.log(rowValues)
                const res = await client.query(
                  insertSQLPM,
                  rowValues
                );

                // var rowValues = [row.tipo, row.ordem_dia, row.data, row.codigo_municipio, row.municipios, row.total_casos]
                // const res = await client.query(insertRow, rowValues)
                // console.log(ob.nome_municipio + ' inserted.')
                // } else  {
                // 	console.log('Duplicated register ignored.')
                // }
              }

              console.log("Doing commit");
              await client.query("COMMIT");
            } catch (e) {
              console.log("Doing rollback");
              await client.query("ROLLBACK");
              throw e;
            } finally {
              client.release();
            }
          }
          )().catch(e => console.error(e.stack))

          console.log("fim");
        });
    } else {
      fs.createReadStream(filepath)
        .pipe(csv())
        .on("data", (row) => {
          csvRows.push(row);
        })
        .on("end", async () => {
          (async () => {
            const client = await pool.connect();
            try {
              await client.query("BEGIN");

              console.log("Else .. " + filepath);

              // var data_inicial = new Date(name_split[1])
              var str_dataIni =
                name_split[1] + " " + name_split[4];
              var data_inicial = moment(
                str_dataIni,
                "YYYYMMDD HHmm"
              ).format("YYYY-MM-DD hh:mm");
              // var data_final = new Date(name_split[2]).format('YYYYMMDD');

              var str_dataFim =
                name_split[2] + " " + name_split[4];
              var data_final = moment(
                str_dataFim,
                "YYYYMMDD HHmm"
              ).format("YYYY-MM-DD hh:mm");

              // var data_final = moment(name_split[2], "YYYYMMDD").format('YYYY-MM-DD')
              var data_atualizacao = moment().format(
                "YYYY-MM-DD"
              );

              for (i in csvRows) {
                var row = csvRows[i];

                var ob = {
                  cd_geocmu: row.Geocodigo,
                  nome_municipio: row.Municipio,
                  latitude: Number(row.Lat),
                  longitude: Number(row.Lon),
                  temperatura: Number(row.TEMP),
                  ur: Number(row.UR),
                };

                /* for initial population*/
                var rowValues = [
                  ob.temperatura,
                  ob.ur,
                  ob.cd_geocmu,
                  data_inicial,
                  data_final,
                ];
                // console.log(rowValues)
                const res = await client.query(
                  updateSQLTEMP,
                  rowValues
                );

                // var rowValues = [row.tipo, row.ordem_dia, row.data, row.codigo_municipio, row.municipios, row.total_casos]
                // const res = await client.query(insertRow, rowValues)
                // console.log(ob.nome_municipio + ' inserted.')
                // } else  {
                // 	console.log('Duplicated register ignored.')
                // }
              }

              console.log("Doing commit");
              await client.query("COMMIT");
            } catch (e) {
              console.log("Doing rollback");
              await client.query("ROLLBACK");
              throw e;
            } finally {
              client.release();
            }
            console.log("fim");
          })().catch((e) => console.error(e.stack));
        });
    }
  }
}

function readFiles(dir, processFile) {
  // read directory

  var fileNames = [];
  fs.readdirSync(dir).forEach((file) => {
    const name = path.parse(file).name;
    if (name.includes("PM25")) {
      fileNames.push(file);
    }
  });

  fs.readdirSync(dir).forEach((file) => {
    const name = path.parse(file).name;
    if (name.includes("TEMP-UR")) {
      fileNames.push(file);
    }
  });

  // fs.readdir(dir, (error, fileNames) => {
  // if (error) throw error;

  for (const [index, filename] of fileNames.entries()) {
    // fileNames.forEach(filename => {
    // get current file name

    const name = path.parse(filename).name;
    // get current file extension
    const ext = path.parse(filename).ext;
    // get current file path
    const filepath = path.resolve(dir, filename);

    // get information about the file
    fs.stat(filepath, function (error, stat) {
      if (error) throw error;

      // check if the current path is a file or a folder
      const isFile = stat.isFile();

      // exclude folders
      if (isFile) {
        // callback, do something with the file

        processFile(filepath, name, ext, stat);

      }
    });
  }
  // });
}
