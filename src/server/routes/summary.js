module.exports = function (app) {

    var dataInjector = app.middleware.dataInjector
    var summary = app.controllers.summary;

    app.get('/service/summary/data', dataInjector, summary.getData);
    app.get('/service/summary/texts', summary.texts);
}
