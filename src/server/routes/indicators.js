module.exports = function (app) {

	var dataInjector = app.middleware.dataInjector;
	var indicators = app.controllers.indicators;

	app.get('/service/indicators/timeseries', dataInjector, indicators.timeseries);
	app.get('/service/indicators/timeseriesTendencias', dataInjector, indicators.timeseriesTendencias);
	app.get('/service/indicators/cities', dataInjector, indicators.cities);
	app.get('/service/indicators/neighborhoods', dataInjector, indicators.neighborhoods);
	app.get('/service/indicators/states', dataInjector, indicators.states);
	app.get('/service/indicators/projections', dataInjector, indicators.projections);
	app.get('/service/indicators/source', dataInjector, indicators.sourceText);
	app.get('/service/indicators/statistics', dataInjector, indicators.statistics);
	app.get('/service/indicators/dates', dataInjector, indicators.dates);
	app.get('/service/indicators/datesNeighborhoods', dataInjector, indicators.datesNeighborhoods);
	app.get('/service/indicators/team', indicators.team);
	app.get('/service/indicators/brasil', indicators.brasil);
	app.get('/service/indicators/summaryBrasil', indicators.summaryBrasil);
	app.get('/service/indicators/datesProjections', dataInjector, indicators.datesProjections);
	app.get('/service/indicators/covidBio', indicators.covidBio);
}
