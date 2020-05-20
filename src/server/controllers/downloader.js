
module.exports = function (app) {
    const fs = require("fs");
    const { convertArrayToCSV } = require('convert-array-to-csv');
    const moment = require('moment');

    var Controller = {};
    var Internal = {};

    var config  = app.config;

    if (!fs.existsSync(config.downloadDataDir)) {
        fs.mkdirSync(config.downloadDataDir);
    }

    Controller.downloadConfirmados = function(request, response) {

        let data = request.queryResult['confirmados'];

        var filename = "confirmados_"+moment().format('YYYY-MM-DD-HH:mm')+".csv";
        var csv  = convertArrayToCSV(data);

        fs.appendFile(config.downloadDataDir+filename, csv, function (err) {
            if (err) throw err;
            response.download(config.downloadDataDir+filename);
        });
    };

    Controller.downloadObitos = function(request, response) {

        let data = request.queryResult['obitos'];

        var filename = "obitos_"+moment().format('YYYY-MM-DD-HH:mm')+".csv";
        var csv = convertArrayToCSV(data);
        fs.appendFile(config.downloadDataDir+filename, csv, function (err) {
            if (err) throw err;
            response.download(config.downloadDataDir+filename);
        });
    }

    return Controller;
};
