module.exports = function (app) {

  var Internal = {}
  var Query = {};

  Query.defaultParams = {
  }

  Query.timeseries = function (params) {

    var filter = ""
    var cd_geocmu = params['cd_geocmu']
    var f = "0"
    if (cd_geocmu == 52) {
      filter = "cd_geocmu <> '52' AND cd_geocmu <> '5300108' AND data not in ('2022-02-07','2022-02-24','2022-03-27','2022-03-30','2022-04-04','2022-04-23','2022-05-26','2022-06-22','2022-06-29') "
      f = "'222'"
    }
    else {
      filter = "cd_geocmu = '" + cd_geocmu + "' AND data not in ('2022-02-07','2022-02-24','2022-03-27','2022-03-30','2022-04-04','2022-04-23','2022-05-26','2022-06-22','2022-06-29') "
      f = "'" + cd_geocmu + "'"
    }

    return [
      {
        id: 'timeseries_go',
        sql: "select (select nome from municipios where cd_geocmu = '" + cd_geocmu + "'), (select cd_geocmu from municipios where cd_geocmu = '" + cd_geocmu + "'), data, sum(confirmados) as confirmados, sum(suspeitos) as suspeitos, sum(obitos) as obitos , sum(descartados) as descartados, sum(recuperados) as recuperados from casos where " + filter + "group by data order by data;"
      },
      {
        id: 'timeseries_cities',
        sql: "select true"
      }


    ];
  }

  Query.timeseriesTendencias = function (params) {

    var filter = ""
    var cd_geocmu = params['cd_geocmu']

    if (cd_geocmu == 52) {
      filter = "cd_geocmu = '52'"
    }
    else {
      filter = "cd_geocmu = '" + cd_geocmu + "' "
    }

    return [
      {
        id: 'timeseries_tendencias_go',
        sql: "select mm7 as media, novos_casos as casos, variacao_per_mm7_14dias as variacao, tendencia_novos_casos as tendencia, data from medias_moveis where " + filter + " group by data,mm7,novos_casos,variacao_per_mm7_14dias,tendencia_novos_casos order by data ASC;"
      },
      {
        id: 'timeseries_tendencias_obitos_go',
        sql: "select mm7 as media, novos_obitos as casos, variacao_per_mm7_14dias as variacao, tendencia_novos_obitos as tendencia, data from medias_moveis_obitos where " + filter + " group by data,mm7,novos_obitos,variacao_per_mm7_14dias,tendencia_novos_obitos order by data ASC;"
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
        sql: "select 0 as rank, m.nome, c.cd_geocmu as geocodigo, c.confirmados from casos c inner join municipios m on m.cd_geocmu = c.cd_geocmu where c.cd_geocmu <> '5300108' and data = (select max(data) from casos) and c.confirmados > 0 order by c.confirmados desc"
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
        sql: "SELECT rank, nome, cd_geocmu as geocodigo, numpoints as confirmados, data_ultima_atualizacao, fonte, regiao FROM v_casos_bairros where numpoints > 0 AND " + filter
      },
      {
        id: 'last_updated',
        sql: "select max(data_ultima_atualizacao) from v_casos_bairros where " + filter
      }
    ]

  }

  Query.deaths = function (params) {

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
        id: 'ranking_deaths',
        sql: "SELECT rank, nome, cd_geocmu as geocodigo, numpoints as obitos, data_ultima_atualizacao, fonte,regiao FROM v_obitos_bairros where numpoints > 0 AND " + filter
      },
      {
        id: 'updated_at',
        sql: "select max(data_ultima_atualizacao) from v_obitos_bairros where " + filter
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
        sql: "select cd_geocmu, total_dias, media_novos_casos_7dias, dias_duplicacao_confirmados from estatisticas where cd_geocmu = '" + cd_geocmu + "'"
      },
      {
        id: 'estatisticas_luisa',
        sql: "select data_pico_infectados_acumudado, data_pico_infectados_incidencia, taxa_crescimento, n_total_infectadados_pico , cd_geocmu from estatisticas_luisa where cd_geocmu = '" + cd_geocmu + "'"
      }
    ]
  }

  Query.dates = function (params) {
    return [

      {
        id: 'dates',
        sql: " SELECT  to_char(max(data), 'DD/MM/YYYY') as data_formatada, to_char(max(data), 'YYYY-MM-DD') as data_db, to_char(max(date_trunc('day', data)), 'DD/MM') as data_rotulo FROM casos GROUP BY data ORDER BY data; "
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
      filter = "  WHERE cd_geocmu = '" + cd_geocmu + "' "
    }
    else {
      filter = " "
    }
    return [

      {
        id: 'dates-neighborhoods',
        sql: "SELECT  to_char(max(data_ultima_atualizacao), 'DD/MM/YYYY') as data_formatada, to_char(max(data_ultima_atualizacao), 'YYYY-MM-DD') as data_db, to_char(max(data_ultima_atualizacao), 'DD/MM') as data_rotulo FROM v_casos_bairros " + filter + " GROUP BY data_ultima_atualizacao ORDER BY data_ultima_atualizacao; "
      },
      {
        id: 'next',
        sql: "select true"
      }
    ]
  }

  Query.datesProjections = function (params) {
    return [

      {
        id: 'dates-projections',
        sql: "SELECT \n" +
          "\tto_char(date_trunc('week', data), 'DD/MM/YYYY') as data_formatada,\n" +
          "\tto_char(date_trunc('week', data), 'YYYY-MM-DD') as data_db,\n" +
          "\tto_char(date_trunc('week', data), 'DD/MM') as data_rotulo\n" +
          "FROM projecao_casos_mapa_luisa\n" +
          "WHERE data >= NOW() \n" +
          "GROUP BY date_trunc('week', data) ORDER BY date_trunc('week', data);"
      },
      {
        id: 'next',
        sql: "select true"
      }
    ]
  }

  Query.datesClima = function (params) {
    return [

      {
        id: 'dates-clima-temperatura',
        // sql: "SELECT data_previsao, data_atualizacao,data_modelo from dados_clima where data_atualizacao = (select max(data_atualizacao) from dados_clima) group by 1,2,3 order by 1 ASC"
        sql: "SELECT data_previsao, to_char(data_previsao, 'DD/MM HH24:MI') as f_data_previsao, data_previsao_utc, to_char(data_atualizacao, 'DD/MM/YYYY') as f_data_atualizacao, to_char(data_modelo, 'DD/MM/YYYY') as f_data_modelo from v_clima_temperatura where data_atualizacao = (select max(data_atualizacao) from v_clima_temperatura) group by 1,2,3,4,5 order by 1 ASC"
      },
      {
        id: 'next',
        sql: "select true"
      }
    ]
  }
  return Query;

};
