var fs = require('fs');
const req = require('request');
var languageJson = require('../assets/lang/language.json');

module.exports = function(app) {

    const config = app.config;


  var Controller = {};
  var Internal = {};

  function numberFormat(numero) {
    numero = numero.toFixed(2).split(".");
    numero[0] = numero[0].split(/(?=(?:...)*$)/).join(".");
    return numero.join(",");
  }

  Controller.timeseries = function(request, response) {
    var language = request.param('lang')
    var chartResult = [
      {
        id: "timeseries_go",
        title: "Goiás",
        label_confirmados: languageJson["charts_box"]["charts_box_timeseries"]["timeseries_go"]["label_confirmados"][language],
        label_recuperados:  languageJson["charts_box"]["charts_box_timeseries"]["timeseries_go"]["label_recuperados"][language],
        getText: function(chart) {
          // var label = chart['indicators'][0]["label"]
          // var value = chart['indicators'][0]["value"]
          // var areaMun = chart['indicators'][0]["area_mun"]

          // var percentual_area_ha = ((value * 100) / areaMun);

          // var text = "De acordo com o projeto Terra Class Cerrado(referente ao ano de 2013), " + region
          // + " possui uma área total de " + numberFormat(parseFloat(areaMun)) + " de hectares, "
          // +"sendo a classe " + label + " a de maior predominância, com " + numberFormat(parseFloat(value))
          // + " de hectares (" + Math.round(percentual_area_ha) + "% da área total). "

          var text = languageJson["charts_box"]["charts_box_timeseries"]["timeseries_go"]["title"][language];

          return text;
        },
        type: "line",
        pointStyle: "rect",
        disabled: false,
        options: {
          title: {
            display: true,
            text: languageJson["charts_box"]["charts_box_timeseries"]["timeseries_go"]["title"][language],
            fontSize: 16
          },
          legend: {
            labels: {
              usePointStyle: true,
              fontColor: "#85560c"
            },
            position: "bottom"
          },
          tooltips: {},
          scales:{
            yAxes:[],
            xAxes:[]
          }

        }
      },
      {
        id: "timeseries_brasil",
        title: "Brasil",
        getText: function(chart) {
          var text = "Estimativas para o Brasil";
          return text;
        },
        type: "line",
        pointStyle: "rect",
        disabled: true,
        options: {
          title: {
            display: true,
            text: 'Estimativas para o Brasil'
          },
          legend: {
            labels: {
              usePointStyle: true,
              fontColor: "#85560c"
            },
            position: "bottom"
          },
          tooltips: {},
          scales:{
            yAxes:[],
            xAxes:[]
          }

        }
      }
    ];

    for (let chart of chartResult) {

      chart["indicators"] = request.queryResult[chart.id];
      chart['show'] = false
			if (chart['indicators'].length > 0){
				chart['show'] = true
				chart['text'] = chart.getText(chart)
			}
    }

    let finalResult = {
      title : languageJson["charts_box"]["charts_box_title"][language],
      timeseries: {
        label: languageJson["charts_box"]["charts_box_timeseries"]["label"][language],
        chartResult : chartResult
      }
    };

    response.send(finalResult);
    response.end();
  };

  return Controller;
};
