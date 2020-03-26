module.exports = function (app) {

  var Internal = {}
  var Query = {};

  Query.defaultParams = {
  }

  Query.projecaotimeseries = function (params) {

    return [
      {
        id: 'timeseries_go',
        sql: "select 'real_go' as fonte,data, sum(confirmados) as confirmados, sum(suspeitos) as suspeitos from casos where data <= now() + interval '10' day group by data order by data;"
      },
      {
        id: 'timeseries_go',
        sql: "SELECT data, projecao_confirmados, projecao_recuperados,confirmados_real,suspeitos_real, descartados_real, obitos_real  FROM real_and_projecao_casos_goias where data <= now() + interval '10' day order by data;"
      },
    ];


  }

  Query.dadosoficiais = function (params) {

    return [
      {
        id: 'timeseries_go',
        sql: "select data, sum(confirmados) as confirmados, sum(suspeitos) as suspeitos, sum(obitos) as obitos from casos where cd_geocmu <> '52' AND cd_geocmu <> '5300108' group by data order by data;"
      },
      {
        id: 'timeseries_states',
        sql: "select data, sum(confirmados) as confirmados, sum(suspeitos) as suspeitos, sum(obitos) as obitos from casos where cd_geocmu <> '52' AND cd_geocmu <> '5300108' group by data order by data;"
      }  

    ];


  }

  return Query;

};