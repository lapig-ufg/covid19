module.exports = function (app) {

	var dataInjector = app.middleware.dataInjector;
	var indicators = app.controllers.indicators;
	
	app.get('/service/indicators/timeseries', dataInjector, indicators.timeseries);
}