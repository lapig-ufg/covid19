module.exports = function (app) {

    var dataInjector = app.middleware.dataInjector;
    var restrictedAccess = app.controllers.restrictedAccess;

    app.get('/service/restrictedAccess/counties', dataInjector, restrictedAccess.counties);
    app.post('/service/restrictedAccess/requireAccess', dataInjector, restrictedAccess.requireAccess);
    app.post('/service/restrictedAccess/access', dataInjector, restrictedAccess.access);
    app.get('/service/restrictedAccess/lablesAccess', restrictedAccess.lablesAccess);
    app.get('/service/restrictedAccess/lablesForm', restrictedAccess.lablesForm);
}
