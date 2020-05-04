var appRoot = require('app-root-path');

module.exports = function (app) {


    var config = {
        "pg": {
            // "user": 'postgres',
            "user": 'covid19',
            "host": '172.18.0.4',
            "database": 'covid19',
            "password": 'covid19123',
            "port": 5432,
            "debug": true
        }
    }


    if (process.env.NODE_ENV == 'prod') {
        config["pg"] = {
            "user": 'covid19',
            "host": '172.18.0.4',
            "database": 'covid19',
            "password": 'covid19123',
            "port": 5432,
            "debug": true
        }
    }


    return config;

}