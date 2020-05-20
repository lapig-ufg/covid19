module.exports = function (app) {
    var downloader = app.controllers.downloader;
    var dataInjector = app.middleware.dataInjector;

    app.get('/service/download/confirmados', dataInjector, downloader.downloadConfirmados);
    app.get('/service/download/obitos', dataInjector, downloader.downloadObitos);
}
