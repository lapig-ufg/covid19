module.exports = function (app) {

	var dataInjector = app.middleware.dataInjector;
	var indicators = app.controllers.indicators;
	
	app.get('/service/indicators/timeseries', dataInjector, indicators.timeseries);
	app.get('/service/indicators/cities', dataInjector, indicators.cities);
	app.get('/service/indicators/states', dataInjector, indicators.states);
	app.get('/service/indicators/projections', dataInjector, indicators.projections);
	app.get('/service/indicators/source', dataInjector, indicators.sourceText);
	app.get('/service/indicators/statistics', dataInjector, indicators.statistics);
}