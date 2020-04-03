module.exports = function(app) {

    var Internal = {}
    var Query = {};

    Query.defaultParams = {
        'nome': 'GO'
    };

    Query.county = function() {
        return "SELECT nome as label, cd_geocmu as value FROM municipios WHERE cd_geocmu <> '52' ORDER BY cd_geocmu ASC";
    };

    Query.search = function() {
        return "SELECT nome, estado, uf, cd_geocmu FROM municipios WHERE cd_geocmu <> '52' and unaccent(nome) ILIKE unaccent(${key}%) LIMIT 10";
    };

    Query.marker = function() {
        return "SELECT *, ST_X(geom) lon, ST_Y(geom) lat, ST_AsGeoJSON(geom) AS geojson FROM $[layer]";
    };

    return Query;

}