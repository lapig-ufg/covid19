module.exports = function(app) {

	var Internal = {}
	var Query = {};

	Query.defaultParams = {
		'nome': 'GO'
	}

	Query.extent = function() {
		return "SELECT ST_AsGeoJSON(geom) geojson, area_mun FROM municipios WHERE unaccent(nome) ILIKE unaccent(${nome}%) ";
	}

	Query.search = function() {
		return "SELECT nome, estado, uf, cd_geocmu FROM municipios WHERE unaccent(nome) ILIKE unaccent(${key}%) LIMIT 10";
	}


	return Query;

}