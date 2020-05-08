var fs = require('fs');
const req = require('request');
var path = require('path');
var languageJson = require('../assets/lang/language.json');

module.exports = function (app) {
    const config = app.config;


    var Controller = {};
    var Internal = {};

    Controller.getData = function (request, response) {

        var language = request.param('lang')

        let indicators = request.queryResult['resumed_indicators']
        let last = request.queryResult['last_update']

        if (indicators.length == 0) {
            indicators.push( {
                nome: 'vazio',
                confirmados: 0,
                suspeitos: 0,
                obitos: 0
            });
        }

        let result = {
            resumed: indicators[0],
            last_update: last[0]
        }

        response.send(result)
        response.end()
    }

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