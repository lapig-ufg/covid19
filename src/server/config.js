var appRoot = require('app-root-path');

module.exports = function (app) {

	var appProducao = '/STORAGE/dpat-files';

	var config = {
		"appRoot": appRoot,
		// "clientDir": appRoot + "/../hotsite/",
		"clientDir": appRoot + "/../client/dist/",
		"langDir": appRoot + "/lang",
		"logDir": appRoot + "/log/",
		"tmp": appRoot + "/tmp/",
		"fieldDataDir": appRoot + '/media/campo/',
		"uploadDataDir": appRoot + "/uploads/",
		"downloadDataDir": appProducao + "/download-dpat/",
		"pg": {
			// "user": 'postgres',
			"user": 'covid19',
			// "host": '10.0.0.14',
			"host": 'localhost',
			"database": 'covid19',
			// "password": 'postgres',
			"password": 'covid19123',
			// "port": 5432,
			"port": 5433,
			// "port": 5434,
			"debug": true
		},
		"port": 3000,
		// "ows_host" : 'http://localhost:5001',
		"ows_host": 'https://ows.lapig.iesa.ufg.br',
		"ows": "https://ows.lapig.iesa.ufg.br",
		"lapig-maps": 'http://maps.lapig.iesa.ufg.br/time-series/MOD13Q1_NDVI/values?'

	};

	if (process.env.NODE_ENV == 'prod') {
		config['dbpath'] = "/data/catalog/Ocultos/d-pat.sqlite"
		config["pg"] = {
			"user": 'covid19',
			"host": '172.18.0.4',
			"database": 'covid19',
			"password": 'covid19123',
			"port": 5432,
			"debug": true
		}
		config["clientDir"] = appRoot + "/../client/dist/lapig-dpat/"
		config["ows_host"] = "https://ows.lapig.iesa.ufg.br"
		config["fieldDataDir"] = appProducao + "/campo-dpat/"
		config["uploadDataDir"] = appProducao + "/upload-dpat/"

	}
	
	return config;

}