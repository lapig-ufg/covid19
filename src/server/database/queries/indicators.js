module.exports = function(app) {

	var Internal = {}
	var Query = {};

	Query.defaultParams = {
	}

	
  
  Query.timeseries = function(params) {

    return [
      {
        id: 'timeseries_go',
        sql: "SELECT data, confirmados, recuperados FROM projecao_casos_go where data <= now() + interval '10' day order by data;"
      },
      {
        id: 'timeseries_brasil',
        sql: "SELECT data, confirmados, recuperados FROM projecao_casos_go where confirmados < 0 order by data"
      }
    ];
	}

	return Query;

};