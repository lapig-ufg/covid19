var fs = require("fs");
var languageJson = require('../assets/lang/language.json');
var path = require('path');

module.exports = function (app) {
    var Controller = {};
    var self = {};

    self.response = null;

    const cliente = app.database.client;
    const summary = app.database.queries.summaryData;

    self.handleSummary = async function(result){
        self.response.send(result.rows[0]);
        self.response.end();
    };

    Controller.getData = function (request, response) {
        self.response =  response;
        cliente.query(summary.query(), self.handleSummary);
    };

    Controller.lastUpdate = function (request, response) {
        self.response =  response;
        cliente.query(summary.queryLastUpdate(), self.handleSummary);
    };

    return Controller;
};