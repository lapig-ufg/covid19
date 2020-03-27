module.exports = function (app) {

	var dataInjector = app.middleware.dataInjector;
	var indicators = app.controllers.indicators;
	
	app.get('/service/indicators/dadosoficiais', dataInjector, indicators.dadosoficiais);
	app.get('/service/indicators/source', dataInjector, indicators.sourceText);
}