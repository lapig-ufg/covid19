var fs = require('fs');
const req = require('request');
var path = require('path');
var languageJson = require('../assets/lang/language.json');

module.exports = function (app) {
    const config = app.config;

    var Controller = {};
    var Internal = {};

    Controller.counties = function (request, response) {
        let counties = request.queryResult['counties'];
        response.send(counties);
        response.end()
    };

    Controller.requireAccess = function (request, response) {
        let gid = request.queryResult['insert'];
        console.log("gid", gid);
        response.send(gid);
        response.end()
    };

    Controller.access = function (request, response) {
        let user = request.queryResult['access'];
        response.send(user);
        response.end()
    };


    Controller.lablesAccess = function (request, response) {
        var language = request.param('lang');

        var accessJson = languageJson["restricted_area"]['access'];

        var result = {};

        Object.keys(accessJson).forEach(function (key, index) {
            result[key] = accessJson[key][language];
        });

        response.send(result);
        response.end();

    };

    Controller.lablesForm = function (request, response) {
        var language = request.param('lang');

        var accessJson = languageJson["restricted_area"]['form'];

        var result = {};

        Object.keys(accessJson).forEach(function (key, index) {
            result[key] = accessJson[key][language];
        });

        response.send(result);
        response.end();

    };

    return Controller;
};