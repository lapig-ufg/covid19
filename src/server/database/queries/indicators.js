module.exports = function (app) {

  var Internal = {}
  var Query = {};

  Query.defaultParams = {
  }

  Query.timeseries = function (params) {

    var filter = ""
    var cd_geocmu = params['cd_geocmu']

    if(cd_geocmu == 52)
    {
      filter = "cd_geocmu <> '52' AND cd_geocmu <> '5300108' "
    }
    else{
      filter = "cd_geocmu = '" + cd_geocmu + "' "
    }

    return [
      {
        id: 'timeseries_go',
        sql: "select (select nome from municipios where cd_geocmu = '" + cd_geocmu + "'), data, sum(confirmados) as confirmados, sum(suspeitos) as suspeitos, sum(obitos) as obitos , sum(descartados) as descartados from casos where " + filter +  " group by data order by data;"
      },
      {
        id: 'timeseries_cities',
        sql: "select true"
      }
     

    ];
  }

  Query.states = function (params) {
  
    return  "select uf , max(total_casos) as total_casos from casos_estados where cd_geouf <> '1058' group by uf order by 2 desc"           
    
  }
  
  Query.cities = function (params) {

    return [
        {
          id: 'ranking_municipios',
          sql: "SELECT nome, cd_geocmu, confirmados_total as confirmados, rank FROM v_ranking_municipios_go"           
        },
        {
          id: 'next',
          sql: "select true"
        }
    ]

  }
  
  Query.projections = function(params) {
    
    var filter = ""
    var sub = ""
    var cd_geocmu = params['cd_geocmu']

      sub = "(select nome from municipios where cd_geocmu = '" + cd_geocmu + "')"
      filter = "cd_geocmu = '" + cd_geocmu + "' "
    
      return [
      {
        id: 'projections_go',
        sql: "select (select max(data) as last_model_date from projecao_casos where tipo = 'Obs'), " + sub + " , tipo, data, sum(confirmados) as confirmados from projecao_casos where " + filter +  " AND data >= (now() - '10 days'::interval day) AND data <= (now() + '5 days'::interval day) group by data,tipo order by data;"
      },
      {
        id: 'next',
        sql: "select true"
      }
    
    ]
  }

  return Query;

};