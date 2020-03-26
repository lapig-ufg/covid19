var fs = require('fs');
const req = require('request');
var languageJson = require('../assets/lang/language.json');

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

  function createDataSetTimeSeriesGO(labels, graphic, language){
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
        {
          label: labels.label_suspeitos,
          data: graphic.map(element => parseInt(element.suspeitos)),
          fill: false,
          backgroundColor: '#982da6',
          borderColor: '#982da6',
          spanGaps: true,
          hidden: true,
        },
        // {
        //   label: labels.label_descartados,
        //   data: graphic.map(element => parseInt(element.descartados)),
        //   fill: false,
        //   backgroundColor: '#1e24c9',
        //   borderColor: '#1e24c9',
        //   spanGaps: true,
        //   hidden: true,
        // },
        // {
        //   label: labels.label_obitos,
        //   data: graphic.map(element => parseInt(element.obitos)),
        //   fill: false,
        //   backgroundColor: '#000000',
        //   borderColor: '#000000',
        //   spanGaps: true,
        //   hidden: true,
        // }
      ]
    };

    return data;
  }

  function createDataSetTimeSeriesTotal(labels, graphic, language) {

    let data = {
      labels: graphic.map(element => formatDate(element.data, language)),
      datasets: [
        {
          label: labels.label_confirmados_projecao,
          data: graphic.map(element => parseInt(element.projecao_confirmados)),
          fill: false,
          backgroundColor: '#e85662',
          borderColor: '#e85662',
          borderDash: labels.borderDashRef,
          spanGaps: true,
        },
        {
          label: labels.label_recuperados_projecao,
          data: graphic.map(element => parseInt(element.projecao_recuperados)),
          fill: false,
          backgroundColor: '#53c274',
          borderColor: '#53c274',
          borderDash: labels.borderDashRef,
          spanGaps: true,
        },
        {
          label: labels.label_confirmados,
          data: graphic.map(element => parseInt(element.confirmados_real)),
          fill: false,
          backgroundColor: '#e83225',
          borderColor: '#e83225',
          spanGaps: true,
        },
        {
          label: labels.label_suspeitos,
          data: graphic.map(element => parseInt(element.suspeitos_real)),
          fill: false,
          backgroundColor: '#982da6',
          borderColor: '#982da6',
          spanGaps: true,
          hidden: true,
        },
        {
          label: labels.label_descartados,
          data: graphic.map(element => parseInt(element.descartados_real)),
          fill: false,
          backgroundColor: '#1e24c9',
          borderColor: '#1e24c9',
          spanGaps: true,
          hidden: true,
        },
        // {
        //   label: labels.label_obitos,
        //   data: graphic.map(element => parseInt(element.obitos_real)),
        //   fill: false,
        //   backgroundColor: '#000000',
        //   borderColor: '#000000',
        //   spanGaps: true,
        // }
      ]
    };


    return data;
  }


  Controller.dadosoficiais = function (request, response) {
    var language = request.param('lang')
    var chartResult = [
      {
        id: "timeseries_go",
        title: "Goiás",
        label_confirmados_projecao: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_confirmados_projecao"][language],
        label_recuperados_projecao: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_recuperados_projecao"][language],
        label_confirmados: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_confirmados"][language],
        label_suspeitos: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_suspeitos"][language],
        label_descartados: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_descartados"][language],
        label_obitos: languageJson["charts_box"]["charts_box_dados_oficiais"]["timeseries_go"]["label_obitos"][language],
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
            display: true,
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
      if (chart.id == 'timeseries_go') {
        chart["dataResult"] = createDataSetTimeSeriesGO(chart, request.queryResult[chart.id], language);
      }
      else {
        chart["dataResult"] = request.queryResult[chart.id]
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
        chartResult: chartResult
      }
    };


    response.send(finalResult);
    response.end();
  };

  return Controller;
};
