module.exports = function (app) {

  var Internal = {}
  var Query = {};

  Query.defaultParams = {
  }

  Query.timeseries = function (params) {

    var filter = ""
    var cd_geocmu = params['cd_geocmu']

    if (cd_geocmu == 52) {
      filter = "cd_geocmu <> '52' AND cd_geocmu <> '5300108' "
    }
    else {
      filter = "cd_geocmu = '" + cd_geocmu + "' "
    }

    return [
      {
        id: 'timeseries_go',
        sql: "select (select nome from municipios where cd_geocmu = '" + cd_geocmu + "'), data, sum(confirmados) as confirmados, sum(suspeitos) as suspeitos, sum(obitos) as obitos , sum(descartados) as descartados from casos where " + filter + " group by data order by data;"
      },
      {
        id: 'timeseries_cities',
        sql: "select true"
      }


    ];
  }

  Query.states = function (params) {

    return "select uf , max(total_casos) as total_casos from casos_estados where cd_geouf <> '1058' group by uf order by 2 desc"

  }

  Query.cities = function (params) {

    return [
      {
        id: 'ranking_municipios',
        sql: "SELECT rank, nome, cd_geocmu as geocodigo, confirmados_total as confirmados FROM v_ranking_municipios_go"
      },
      {
        id: 'next',
        sql: "select true"
      }
    ]

  }

  Query.neighborhoods = function (params) {

    var filter = ""
    var cd_geocmu = params['cd_geocmu']

    var timefilter = params['timefilter']

    if (cd_geocmu == 52) {
      filter = "cd_geocmu = '52' AND data_ultima_atualizacao = " + timefilter
    }
    else {
      filter = "cd_geocmu = '" + cd_geocmu + "' AND data_ultima_atualizacao = " + timefilter
    }

    return [
      {
        id: 'ranking_neighborhoods',
        sql: "SELECT rank, nome, cd_geocmu as geocodigo, numpoints as confirmados, data_ultima_atualizacao FROM v_casos_bairros where numpoints > 0 AND " + filter
      },
      {
        id: 'last_updated',
        sql: "select max(data_ultima_atualizacao) from v_casos_bairros where " + filter
      }
    ]

  }

  Query.projections = function (params) {

    var filter = ""
    var sub = ""
    var cd_geocmu = params['cd_geocmu']

    sub = "(select nome from municipios where cd_geocmu = '" + cd_geocmu + "')"
    filter = "cd_geocmu = '" + cd_geocmu + "' "

    return [
      {
        id: 'projections_go',
        sql: "select (select max(data) as last_model_date from projecao_casos where tipo = 'Obs'), " + sub + " , tipo, data, sum(confirmados) as confirmados from projecao_casos where " + filter + " AND data >= (now() - '10 days'::interval day) AND data <= (now() + '5 days'::interval day) group by data,tipo order by data;"
      },
      {
        id: 'next',
        sql: "select true"
      }
    ]
  }
  Query.statistics = function (params) {
    var cd_geocmu = params['cd_geocmu']
    return [

      {
        id: 'estatisticas_municipios',
        sql: "select cd_geocmu, total_dias, media_novos_casos_3dias, dias_duplicacao_confirmados from estatisticas where cd_geocmu = '" + cd_geocmu +"'"
      },
      {
        id: 'next',
        sql: "select true"
      }
    ]
  }

  Query.dates = function (params) {
    return [

      {
        id: 'dates',
        sql: " SELECT  to_char(max(data), 'DD/MM/YYYY') as data_formatada, to_char(max(data), 'YYYY-MM-DD') as data_db, to_char(max(data), 'DD/MM') as data_rotulo FROM casos GROUP BY data ORDER BY data; "
      },
      {
        id: 'next',
        sql: "select true"
      }
    ]
  }

  Query.datesNeighborhoods = function (params) {
    var filter = ""
    var cd_geocmu = params['cd_geocmu']

    if (cd_geocmu != 52 && cd_geocmu != undefined) {
      filter = "  WHERE cd_geocmu = '"+cd_geocmu+"' "
    }
    else {
      filter = " "
    }
    console.log("log: ",filter);
    return [

      {
        id: 'dates-neighborhoods',
        sql: "SELECT  to_char(max(data_ultima_atualizacao), 'DD/MM/YYYY') as data_formatada, to_char(max(data_ultima_atualizacao), 'YYYY-MM-DD') as data_db, to_char(max(data_ultima_atualizacao), 'DD/MM') as data_rotulo FROM v_casos_bairros "+filter+" GROUP BY data_ultima_atualizacao ORDER BY data_ultima_atualizacao; "
      },
      {
        id: 'next',
        sql: "select true"
      }
    ]
  }




  return Query;

};