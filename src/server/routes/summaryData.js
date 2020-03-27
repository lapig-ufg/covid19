module.exports = function (app) {

    var dataInjector = app.middleware.dataInjector
    var summary = app.controllers.summaryData;

    app.get('/service/summary/data', dataInjector, summary.getData);
}
