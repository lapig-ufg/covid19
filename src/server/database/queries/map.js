module.exports = function(app) {

	var Internal = {}
	var Query = {};

	Query.defaultParams = {
		'nome': 'GO'
	}

	Query.extent = function() {
		return "SELECT ST_AsGeoJSON(geom) geojson, area_mun FROM municipios WHERE cd_geocmu = (${cd_geocmu}) ";
	}

	Query.search = function() {
		return "SELECT nome, estado, uf, cd_geocmu FROM municipios WHERE cd_geocmu <> '52' and unaccent(nome) ILIKE unaccent(${key}%) LIMIT 10";
	}

	Query.marker = function(params) {

		var lay = params['layer']

		return "SELECT *, '" + lay + "' as source, ST_X(geom) lon, ST_Y(geom) lat, ST_AsGeoJSON(geom) AS geojson FROM $[layer] where $[filter]";
	}

	return Query;

}