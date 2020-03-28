var fs = require("fs");
var path = require('path');

module.exports = function (app) {
    var Controller = {};
    var self = {};

    self.response = null;

    const cliente = app.database.client;
    const summary = app.database.queries.summaryData;

    self.handleSummary = async function (result) {
        self.response.send(result.rows[0]);
        self.response.end();
    };

    Controller.getData = function (request, response) {
        self.response = response;
        cliente.query(summary.query(), self.handleSummary);
    };

    Controller.lastUpdate = function (request, response) {
        self.response = response;
        cliente.query(summary.queryLastUpdate(), self.handleSummary);
    };

    Controller.texts = function (request, response) {
        var language = request.param('lang')

        var jsonPath = path.join(__dirname, '..', 'assets', 'lang', 'language.json');
        var languageFile = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        var dialogJson = languageFile["summary_box"];

        var keys = {};

        Object.keys(dialogJson).forEach(function (key, index) {
            keys[key] = key
        });

        var result = {};
        Object.keys(keys).forEach(function (key, index) {

            if (dialogJson[key].hasOwnProperty("pt-br")) {
                result[key] = dialogJson[key][language]
            } 
        });

        response.send(result);
        response.end();
    };

    return Controller;
};