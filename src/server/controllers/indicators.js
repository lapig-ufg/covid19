var fs = require('fs');
const req = require('request');
const moment = require('moment');
var languageJson = require('../assets/lang/language.json');

const rp = require("request-promise");

module.exports = function (app) {

  const config = app.config;

  var Controller = {};
  var Internal = {};

  function numberFormat(numero) {
    numero = numero.toFixed(2).split(".");
    numero[0] = numero[0].split(/(?=(?:...)*$)/).join(".");
    return numero.join(",");
  };


  function formatDate(date, language) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    let formated = ''
    if (language == 'pt-br') {
      formated = [day, month, year].join('-');
    }
    else {
      formated = [month, day, year].join('-');
    }

    return formated;
  }

  function createDataSetTimeSeriesGO(labels, graphic, language) {


    console.log(graphic)

    let hideobito = true;
    let hiderecuperados = true;
    graphic.forEach(function (item, i) {
      if (parseInt(item.obitos) > 0) {
        hideobito = false
      }

      if (item.nome == "GOIÂNIA") {
        if (parseInt(item.recuperados) > 0) {
          hiderecuperados = false
        }
      }

    })

    let data = {
      labels: graphic.map(element => formatDate(element.data, language)),
      datasets: [
        {
          label: labels.label_confirmados,
          data: graphic.map(element => parseInt(element.confirmados)),
          fill: false,
          backgroundColor: '#e83225',
          borderColor: '#e83225',
          spanGaps: true,
        },
        // {
        //   label: labels.label_suspeitos,
        //   data: graphic.map(element => parseInt(element.suspeitos)),
        //   fill: false,
        //   backgroundColor: '#982da6',
        //   borderColor: '#982da6',
        //   spanGaps: true,
        //   hidden: true,
        // },
        {
          label: labels.label_recuperados,
          data: graphic.map(element => parseInt(element.recuperados)),
          fill: false,
          backgroundColor: '#0959db',
          borderColor: '#0959db',
          spanGaps: true,
          hidden: hiderecuperados,
        },
        {
          label: labels.label_obitos,
          data: graphic.map(element => parseInt(element.obitos)),
          fill: false,
          backgroundColor: '#000000',
          borderColor: '#000000',
          spanGaps: true,
          hidden: hideobito,
        }
      ]
    };

    return data;
  }

  function createProjectionsGO(labels, graphic, conf, language) {

    let data = {
      labels: graphic.map(element => formatDate(element.data, language)),
      datasets: [
        {
          label: labels.label_confirmados,
          data: conf.map(element => parseInt(element.confirmados)),
          fill: false,
          backgroundColor: '#e31425',
          borderColor: '#e31425',
          // borderDash: labels.borderDashRef,
          spanGaps: true,
        },
        {
          label: labels.label_previstos,
          data: graphic.map(element => parseInt(element.confirmados)),
          fill: false,
          backgroundColor: '#c9700a',
          borderColor: '#c9700a',
          spanGaps: true,
          borderDash: labels.borderDashRef,
        },

      ]
    };

    return data;
  }

  Controller.timeseries = function (request, response) {
    var language = request.param('lang')
    var chartResult = [
      {
        id: "timeseries_go",
        title: "",
        label_confirmados_projecao: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_confirmados_projecao"][language],
        label_recuperados_projecao: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_recuperados_projecao"][language],
        label_confirmados: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_confirmados"][language],
        label_suspeitos: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_suspeitos"][language],
        label_descartados: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_descartados"][language],
        label_obitos: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_obitos"][language],
        label_recuperados: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_recuperados"][language],
        borderDashRef: [5, 5],
        getText: function (chart) {
          // var label = chart['indicators'][0]["label"]
          // var value = chart['indicators'][0]["value"]
          // var areaMun = chart['indicators'][0]["area_mun"]

          // var percentual_area_ha = ((value * 100) / areaMun);

          // var text = "De acordo com o projeto Terra Class Cerrado(referente ao ano de 2013), " + region
          // + " possui uma área total de " + numberFormat(parseFloat(areaMun)) + " de hectares, "
          // +"sendo a classe " + label + " a de maior predominância, com " + numberFormat(parseFloat(value))
          // + " de hectares (" + Math.round(percentual_area_ha) + "% da área total). "

          var text = languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["title"][language];

          return text;
        },
        type: "line",
        pointStyle: "rect",
        disabled: false,
        options: {
          title: {
            display: false,
            text: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["text"][language],
            fontSize: 10,
            position: "bottom"
          },
          legend: {
            labels: {
              usePointStyle: true,
              fontColor: "#85560c"
            },
            position: "bottom"
          },
          tooltips: {},
          scales: {
            yAxes: [],
            xAxes: []
          }
        }
      }

    ];

    for (let chart of chartResult) {

      chart['show'] = false
      var qr = request.queryResult[chart.id]

      if (chart.id == 'timeseries_go') {
        chart["dataResult"] = createDataSetTimeSeriesGO(chart, qr, language);
      }
      else {
        chart["dataResult"] = qr
      }
      if (chart['dataResult'].labels.length > 0) {
        chart['show'] = true
        chart['text'] = chart.getText(chart)
      }

    }

    let finalResult = {
      title: languageJson["charts_box"]["charts_box_title"][language],
      timeseries: {
        label: languageJson["charts_box"]["charts_box_dados_oficiais"]["label"][language],
        not_cases: languageJson["charts_box"]["charts_box_dados_oficiais"]["not_cases"][language],
        chartResult: chartResult
      }
    };


    response.send(finalResult);
    response.end();
  };

  Controller.cities = function (request, response) {

    var language = request.param('lang')

    var queryResult = request.queryResult['ranking_municipios']

    if (queryResult.length > 0) {

      queryResult.map(function (item, i) {

        if (i > 0) {
          //Get our previous list item
          var prevItem = queryResult[i - 1];
          if (parseInt(prevItem.confirmados) == parseInt(item.confirmados)) {
            //Same score = same rank
            item.rank = prevItem.rank;
          } else {
            //Not the same score, give em the current iterated index + 1
            item.rank = prevItem.rank + 1;
          }
        } else {
          //First item takes the rank 1 spot
          item.rank = 1;
        }

        return item;
      });

    }
    let total_confirmados = 0;
    let data_ultima_atualizacao = null;
    if (Array.isArray(queryResult)) {
      if (queryResult.length > 0) {
        queryResult.forEach(function (item, index) {
          total_confirmados += item.confirmados;
        });
      } else {
        total_confirmados = null;
      }
    } else {
      total_confirmados = null;
    }

    var result = {
      label: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_municipios"]["label"][language],
      description: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_municipios"]["description"][language],
      title: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_municipios"]["title"][language],
      tooltip: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_municipios"]["tooltip_text"][language],
      properties: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_municipios"]["properties_name"][language],
      filename: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_municipios"]["filename"][language],
      series: queryResult,
      total_cities: Array.isArray(queryResult) ? queryResult.length : null,
      total_confirmados: total_confirmados,
      label_ses: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_municipios"]["label_ses"][language],
      label_confirmed_ses: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_municipios"]["label_confirmed_ses"][language],
      label_total_ses: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_municipios"]["label_total_ses"][language],
      label_without_city: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_municipios"]["label_without_city"][language],
    }

    response.send(result)
    response.end()

  }

  Controller.neighborhoods = function (request, response) {

    var language = request.param('lang')

    var queryResult = request.queryResult['ranking_neighborhoods']
    var queryResultDate = request.queryResult['last_updated']

    let show = false
    if (queryResult.length > 0) {
      show = true

      queryResult.map(function (item, i) {
        if (i > 0) {
          //Get our previous list item
          var prevItem = queryResult[i - 1];
          if (parseInt(prevItem.confirmados) == parseInt(item.confirmados)) {
            //Same score = same rank
            item.rank = prevItem.rank;
          } else {
            //Not the same score, give em the current iterated index + 1
            item.rank = prevItem.rank + 1;
          }
        } else {
          //First item takes the rank 1 spot
          item.rank = 1;
        }

        return item;
      });

    }

    let total_confirmados = 0;
    let data_ultima_atualizacao = null;
    let fonte = null;
    if (Array.isArray(queryResult)) {
      if (queryResult.length > 0) {
        queryResult.forEach(function (item, index) {
          fonte = item.fonte;
          total_confirmados += item.confirmados;
          data_ultima_atualizacao = item.data_ultima_atualizacao;
        });
      } else {
        total_confirmados = null;
      }
    } else {
      total_confirmados = null;
    }

    var result = {
      label: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_neighborhoods"]["label"][language],
      description: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_neighborhoods"]["description"][language],
      title: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_neighborhoods"]["title"][language],
      tooltip: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_neighborhoods"]["tooltip_text"][language],
      properties: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_neighborhoods"]["properties_name"][language],
      filename: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_neighborhoods"]["filename"][language],
      label_sms: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_neighborhoods"]["label_sms"][language],
      label_confirmed: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_neighborhoods"]["label_confirmed"][language],
      label_total: languageJson["charts_box"]["charts_box_dados_oficiais"]["ranking_neighborhoods"]["label_total"][language],
      show: show,
      total_neighborhoods: Array.isArray(queryResult) ? queryResult.length : null,
      total_confirmados: total_confirmados,
      last_updated: queryResultDate[0]['max'],
      fonte: fonte,
      data_ultima_atualizacao: moment(data_ultima_atualizacao).format("DD/MM/YYYY"),
      series: queryResult
    }
    response.send(result)
    response.end()

  }

  Controller.projections = function (request, response) {

    var language = request.param('lang')
    var chartResult = [
      {
        id: "projections_go",
        title: "",
        label_confirmados: languageJson["charts_box"]["charts_box_projecoes"]["projections_go"]["label_confirmados"][language],
        label_recuperados: languageJson["charts_box"]["charts_box_projecoes"]["projections_go"]["label_recuperados"][language],
        label_obitos: languageJson["charts_box"]["charts_box_projecoes"]["projections_go"]["label_obitos"][language],
        label_previstos: languageJson["charts_box"]["charts_box_projecoes"]["projections_go"]["label_previstos"][language],
        borderDashRef: [4, 4],
        getText: function (chart) {

          var text = languageJson["charts_box"]["charts_box_projecoes"]["projections_go"]["title"][language];

          return text;
        },
        type: "line",
        pointStyle: "rect",
        disabled: false,
        options: {
          title: {
            display: false,
            text: languageJson["charts_box"]["charts_box_projecoes"]["projections_go"]["text"][language],
            fontSize: 10,
            position: "bottom"
          },
          legend: {
            labels: {
              usePointStyle: true,
              fontColor: "#85560c"
            },
            position: "bottom"
          },
          tooltips: { mode: "index" },
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: languageJson["charts_box"]["charts_box_projecoes"]["projections_go"]["ytitle"][language],
              }
            }],
            xAxes: []
          }

        }
      }

    ];

    for (let chart of chartResult) {

      var qr = request.queryResult[chart.id]
      chart['show'] = false
      if (chart.id == 'projections_go') {

        var conf = []
        var prev = []
        var qFinal = []
        if (qr.length > 0) {
          chart['show'] = true
          qr.filter(item => item.confirmados != -1)
            .forEach(item => {
              // .forEach(item => item.tipo == 'Obs' ? conf.push(item) : prev.push(item)            )

              qFinal.push(item)
              if (item.tipo == 'Obs') {
                conf.push(item)
              }
            });
          chart["last_model_date"] = moment(qFinal[0]['last_model_date']).format("DD/MM/YYYY")
        }
        chart["dataResult"] = createProjectionsGO(chart, qFinal, conf, language);
      }
      else {
        chart["dataResult"] = qr
      }
    }


    let finalResult = {
      timeseries: {
        label: languageJson["charts_box"]["charts_box_projecoes"]["label"][language],
        not_cases: languageJson["charts_box"]["charts_box_projecoes"]["projections_go"]["not_cases"][language],
        last_updated: languageJson["charts_box"]["charts_box_projecoes"]["projections_go"]["last_updated"][language],
        chartResult: chartResult
      }
    };


    response.send(finalResult);
    response.end();
  };


  Controller.brasil = async function (request, response) {
    var language = request.param('lang')


    let web = await rp('https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalCasos');

    let bd = JSON.parse(web);

    let casos = bd['dias'];

    var t = {

      label_confirmados: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_confirmados"][language],
      label_obitos: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_obitos"][language],
      borderDashRef: [5, 5],
      type: "line",
      pointStyle: "rect",
      disabled: false,
      options: {
        title: {
          display: false,
          text: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["text"][language],
          fontSize: 10,
          position: "bottom"
        },
        legend: {
          labels: {
            usePointStyle: true,
            fontColor: "#85560c"
          },
          position: "bottom"
        },
        tooltips: {},
        scales: {
          yAxes: [],
          xAxes: []
        }

      }
    }

    let data = {
      labels: casos.map(element => element._id + "/2020"),
      datasets: [
        {
          label: t.label_confirmados,
          data: casos.map(element => parseInt(element.casosAcumulado)),
          fill: false,
          backgroundColor: '#e83225',
          borderColor: '#e83225',
          spanGaps: true,
        },
        {
          label: t.label_obitos,
          data: casos.map(element => parseInt(element.obitosAcumulado)),
          fill: false,
          backgroundColor: '#000000',
          borderColor: '#000000',
          spanGaps: true,
          // hidden: hideobito,
        }
      ]
    };

    let finalResult = {
      label: languageJson["charts_box"]["charts_box_dados_oficiais"]["brasil"]["label"][language],
      dataset: data,
      options: t,
      show: true,
      title: languageJson["charts_box"]["charts_box_dados_oficiais"]["brasil"]["title"][language]
    };

    response.send(finalResult);
    response.end();

  };

  Controller.summaryBrasil = async function (request, response) {

    // let casos = await rp('https://brasil.io/covid19/cities/cases/');
    //
    // let casosJson = JSON.parse(casos);
    // let summary = casosJson.total;
    //
    // let result = {
    //   last_update: moment(summary.date).format("DD/MM/YYYY"),
    //   confirmados: summary.confirmed,
    //   obitos: summary.deaths
    // };

    let requestLastUpdate = {
      headers: {
        'x-parse-application-id':'unAFkcaNDeXajurGB7LChj8SgQYS2ptm'
      },
      uri: 'https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalGeral',
      method: 'GET'
    };

    let lastUpdate = await rp(requestLastUpdate);
    let casos = await rp('https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalGeralApi');

    let lastUpdateJson = JSON.parse(lastUpdate);
    let casosJson = JSON.parse(casos);

    let result = {
      last_update: lastUpdateJson.results[0].dt_atualizacao,
      confirmados: casosJson.confirmados.total,
      obitos: casosJson.obitos.total,
      letalidade: casosJson.obitos.letalidade
    };

    response.send(result);
    response.end();
  };



  Controller.states = async function (request, response) {
    var language = request.param('lang')
    //
    // // let web = await rp('https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalEstado');
    // let web = await rp('https://brasil.io/api/dataset/covid19/caso/data/?format=json&is_last=True&place_type=state');
    //
    // let bd = JSON.parse(web);
    // var queryResult = bd.results
    //
    // let compare = function( a, b ) {
    //   if ( a.confirmed < b.confirmed ){
    //     return 1;
    //   }
    //   if ( a.confirmed > b.confirmed ){
    //     return -1;
    //   }
    //   return 0;
    // }
    //
    // queryResult.sort( compare );
    //
    // var qResult = [];
    //
    // queryResult.forEach(function (row) {
    //
    //   qResult.push({
    //     uf: row['state'],
    //     total_casos: row['confirmed']
    //   })
    //
    // })


    let web = await rp('https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalEstado');

    let bd = JSON.parse(web);
    var queryResult = bd

    var qResult = [];

    queryResult.forEach(function (row) {

      qResult.push({
        uf: row['nome'],
        total_casos: row['casosAcumulado']
      })
    })

    var regionResult = [];
    qResult.filter(item => item.uf == 'GO')
      .forEach(item => regionResult.push(item))


    for (var i = 0; i < qResult.length; i++) {
      if (qResult[i].uf == 'GO') {
      }
      else {
        regionResult.push(qResult[i])
      }

      if (regionResult.length == 10) {
        break;
      }
    }

    let dataStates = {
      labels: regionResult.map(element => element.uf),
      datasets: [
        {
          label: languageJson["charts_box"]["charts_box_dados_oficiais"]["charts_box_states"]["label_confirmados"][language],
          data: regionResult.map(element => element.total_casos),
          fill: true,
          backgroundColor: '#b52016'
        }
      ],
      description: languageJson["charts_box"]["charts_box_dados_oficiais"]["charts_box_states"]["description"][language],
      pointStyle: 'rect',
      label: languageJson["charts_box"]["charts_box_dados_oficiais"]["charts_box_states"]["label"][language],
      optionsStates: {
        tooltips: {
        },
        scales: {
          xAxes: [
            {
              ticks: {
              }
            }
          ]
        },
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            fontSize: 12
          }
        }
      }
    };

    response.send(dataStates)
    response.end()

  }

  Controller.sourceText = function (request, response) {
    var language = request.param('lang')
    var sourceResult = {
      id: "source",
      title: languageJson["charts_box"]["source"]["label"][language],
      technical_note_title: languageJson["charts_box"]["source"]["technical_note_title"][language],
      technical_note: languageJson["charts_box"]["source"]["technical_note"][language],
    };
    response.send(sourceResult);
    response.end();
  };

  Controller.statistics = function (request, response) {
    var language = request.param('lang')

    var queryResult = request.queryResult['estatisticas_municipios']

    var queryResultLuisa = request.queryResult['estatisticas_luisa']


    var res = {
      total_dias: queryResult[0]['total_dias'],
      media_novos_casos_3dias: queryResult[0]['media_novos_casos_3dias'],
      dias_duplicacao_confirmados: queryResult[0]['dias_duplicacao_confirmados'],
      data_pico_infectados_incidencia: queryResultLuisa[0]['data_pico_infectados_incidencia'],
      data_pico_infectados_acumudado: queryResultLuisa[0]['data_pico_infectados_acumudado'],
      n_total_infectadados_pico: queryResultLuisa[0]['n_total_infectadados_pico'],
      taxa_crescimento: queryResultLuisa[0]['taxa_crescimento']
    }

    let texts = {
      title: languageJson["charts_box"]["charts_box_projecoes"]["statistics"]["title"][language],
      total_dias: languageJson["charts_box"]["charts_box_projecoes"]["statistics"]["text"]["total_dias"][language],
      media_novos_casos_3dias: languageJson["charts_box"]["charts_box_projecoes"]["statistics"]["text"]["media_novos_casos_3dias"][language],
      dias_duplicacao_confirmados: languageJson["charts_box"]["charts_box_projecoes"]["statistics"]["text"]["dias_duplicacao_confirmados"][language],
      taxa_crescimento: languageJson["charts_box"]["charts_box_projecoes"]["statistics"]["text"]["taxa_crescimento"][language],
      n_total_infectadados_pico: languageJson["charts_box"]["charts_box_projecoes"]["statistics"]["text"]["n_total_infectadados_pico"][language],
      data_pico_infectados_acumudado: languageJson["charts_box"]["charts_box_projecoes"]["statistics"]["text"]["data_pico_infectados_acumudado"][language]
    }

    response.send({
      result: res,
      text: texts
    }
    );
    response.end();
  }

  Controller.team = function (request, response) {
    var language = request.param('lang');

    var teamJson = languageJson["team"];
    var result = {};

    result.title = teamJson.title[language];
    result.info = teamJson.info[language];
    result.methodology_p1 = teamJson.methodology_p1[language];
    result.methodology_p2 = teamJson.methodology_p2[language];
    result.methodology_p3 = teamJson.methodology_p3[language];
    result.contact = teamJson.contact[language];
    result.title_team = teamJson.title_team[language];
    result.data = [];

    teamJson.data.forEach(function (elem, elmIndex) {

      let membersLang = [];

      teamJson.data[elmIndex].members.forEach(function (member, index) {
        membersLang.push(
          {
            nome: teamJson.data[elmIndex].members[index].nome,
            link: teamJson.data[elmIndex].members[index].link,
            description: teamJson.data[elmIndex].members[index].description[language]
          }
        );
      });

      result.data.push({
        title: teamJson.data[elmIndex].title[language],
        members: membersLang
      });
    });

    response.send(result);
    response.end();

  };

  Controller.dates = function (request, response) {
    let dates = request.queryResult['dates'];
    response.send(dates);
    response.end()
  };

  Controller.datesNeighborhoods = function (request, response) {
    let dates = request.queryResult['dates-neighborhoods'];
    response.send(dates);
    response.end()
  };

  Controller.datesProjections = function (request, response) {
    let dates = request.queryResult['dates-projections'];
    response.send(dates);
    response.end()
  };

  return Controller;
};





