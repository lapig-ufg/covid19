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
        response.send(gid);
        response.end()
    };

    Controller.access = function (request, response) {
        let user = request.queryResult['access'];
        console.log("access: ", user);
        response.send(user[0]);
        response.end()
    };


    return Controller;
};