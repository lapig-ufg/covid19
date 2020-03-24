var fs = require('fs');
const req = require('request');

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
    var chartResult = [
      {
        id: "timeseries_go",
        title: "Goiás",
        label_confirmados: "Confirmados",
        label_recuperados: "Recuperados",
        getText: function(chart) {
          // var label = chart['indicators'][0]["label"]
          // var value = chart['indicators'][0]["value"]
          // var areaMun = chart['indicators'][0]["area_mun"]

          // var percentual_area_ha = ((value * 100) / areaMun);

          // var text = "De acordo com o projeto Terra Class Cerrado(referente ao ano de 2013), " + region
          // + " possui uma área total de " + numberFormat(parseFloat(areaMun)) + " de hectares, "
          // +"sendo a classe " + label + " a de maior predominância, com " + numberFormat(parseFloat(value))
          // + " de hectares (" + Math.round(percentual_area_ha) + "% da área total). "

          var text = "Estimativas para o Estado de Goiás";

          return text;
        },
        type: "line",
        pointStyle: "rect",
        disabled: false,
        options: {
          title: {
            display: false
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
            yAxes:[]
        }

        }
      },
      {
        id: "timeseries_brasil",
        title: "Brasil",
        getText: function(chart) {
          var text = "Estimativas para o Estado de Goiás";
          return text;
        },
        type: "line",
        pointStyle: "rect",
        disabled: true,
        options: {
          title: {
            display: false
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
              yAxes:[]
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

    response.send(chartResult);
    response.end();
  };

  return Controller;
};
