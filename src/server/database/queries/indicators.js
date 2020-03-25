module.exports = function(app) {

	var Internal = {}
	var Query = {};

	Query.defaultParams = {
	}

	
  
  Query.timeseries = function(params) {

    return [
      {
        id: 'timeseries_go_projecao',
        sql: "SELECT 'projecao_go' as fonte, data, confirmados, recuperados FROM projecao_casos_go where data <= now() + interval '10' day order by data;"
      },
      {
        id: 'timeseries_brasil_projecao',
        sql: "SELECT 'projecao_brasil' as fonte, data, confirmados, recuperados FROM projecao_casos_go where confirmados < 0 order by data;"
      },
      {
        id: 'timeseries_go_real',
        sql: "select 'real_go' as fonte,data, sum(confirmados) as confirmados, sum(suspeitos) as suspeitos from casos where data <= now() + interval '10' day group by data order by data;"
      },
      {
        id: 'timeseries_go_total',
        sql: "SELECT data, projecao_confirmados, projecao_recuperados,confirmados_real,suspeitos_real, descartados_real, obitos_real  FROM real_and_projecao_casos_goias where data <= now() + interval '10' day order by data;"
      },
      
    ];


	}

	return Query;

};