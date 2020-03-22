module.exports = function(app) {

	var Internal = {}
	var Query = {};

	Query.defaultParams = {
		'type': 'state',
		'region': 'GO'
	}

	Query.extent = function() {
		return "SELECT ST_AsGeoJSON(geom) geojson, (ST_AREA(geom,true)/1000000.0) as area FROM municipios WHERE type=${type} AND value=${region}";
	}

	Query.search = function() {
		return "SELECT text, value, type, cd_geocmu FROM regions WHERE unaccent(text) ILIKE unaccent(${key}%) AND type in ('state', 'city') LIMIT 10";
	}


	return Query;

}