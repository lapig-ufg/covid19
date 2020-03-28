module.exports = function (app) {

    var dataInjector = app.middleware.dataInjector
    var summary = app.controllers.summaryData;

    app.get('/service/summary/data', dataInjector, summary.getData);
    app.get('/service/summary/last-update', dataInjector, summary.lastUpdate);
    app.get('/service/summary/texts', summary.texts);
}
