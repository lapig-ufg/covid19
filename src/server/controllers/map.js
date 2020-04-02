var fs = require("fs");
var languageJson = require('../assets/lang/language.json');
var path = require('path');

module.exports = function (app) {
  var Controller = {};
  var Internal = {};

  var client = app.database.client;
  var queries = app.database.queries.map;

  Internal.filterLanguage = function filterItems(query, array) {
    return array.filter(function (el) {
      if (el[0] === query) {
        return el[1];
      }
    })
  };

  Controller.extent = function (request, response) {
    var queryResult = request.queryResult;

    var result = {
      type: "Feature",
      geometry: JSON.parse(queryResult[0].geojson),
      area_mun: queryResult[0].area_mun
    };

    response.send(result);
    response.end();
  };

  Controller.descriptor = function (request, response) {

    var language = request.param('lang')

    var result = {
      regionFilterDefault: "",
      type: languageJson["descriptor"]["type_of_information_label"][language],
      maskUrl: "assets/geojson/mask.geojson",
      maskOption: 'mask',
      groups: [
        {
          id: "informacoes",
          label: languageJson["descriptor"]["informacoes"]["label"][language],
          group_expanded: true,
          layers: [{
            id: "casos_covid_confirmados",
            label: languageJson["descriptor"]["informacoes"]["layers"]["casos_covid_confirmados"]["label"][language],
            visible: true,
            selectedType: "covid19_municipios_casos",
            types: [{
              value: "covid19_municipios_casos",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["casos_covid_confirmados"]["types"]["covid19_municipios_casos"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            }]
          },
          {
            id: "urban_traffic",
            label: "Tempo Real",
            visible: false,
            selectedType: "urban_traffic_real_time",
            types: [{
              value: "urban_traffic_real_time",
              Viewvalue: "Google Traffic",
              source: 'external',
              url: 'https://mt1.google.com/vt?lyrs=h@159000000,traffic|seconds_into_week:-1&style=3&x={x}&y={y}&z={z}',
              opacity: 0.8,
              order: 3
            }]
          }
          ]
        },
        {
          id: "servicos",
          label: languageJson["descriptor"]["servicos"]["label"][language],
          group_expanded: false,
          layers: [
            {
              id: "qtd_populacional",
              label: languageJson["descriptor"]["informacoes"]["layers"]["qtd_populacional"]["label"][language],
              visible: false,
              selectedType: "covid19_ibge_populacao",
              types: [{
                value: "covid19_ibge_populacao",
                Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["qtd_populacional"]["types"]["covid19_ibge_populacao"]["view_value"][language],
                regionFilter: true,
                source: 'ows',
                opacity: 0.8,
                order: 3
              }]
            },
            {
              id: "gyn_locais_vacinacao",
              label: languageJson["descriptor"]["servicos"]["layers"]["gyn_locais_vacinacao"]["label"][language],
              visible: false,
              selectedType: "gyn_locais_vacinacao_gripe",
              types: [{
                value: "gyn_locais_vacinacao_gripe",
                Viewvalue: languageJson["descriptor"]["servicos"]["layers"]["gyn_locais_vacinacao"]["types"]["gyn_locais_vacinacao_gripe"]["view_value"][language],
                url: 'service/map/marker?layer=vacinacao_gripe',
                iconUrl: 'assets/markers/icon.png',
                source: 'geojson',
                opacity: 0.8,
                order: 1
              }]
            }
          ]
        }
      ],
      basemaps: [{
        id: "basemaps",
        defaultBaseMap: "mapbox",
        types: [
          {
            value: "googlemaps",
            viewValue: languageJson["descriptor"]["basemaps"]["types"]["googlemaps"][language],
            visible: true
          },
          {
            value: "estradas",
            viewValue: languageJson["descriptor"]["basemaps"]["types"]["estradas"][language],
            visible: false
          },
          {
            value: "mapbox",
            viewValue: languageJson["descriptor"]["basemaps"]["types"]["mapbox"][language],
            visible: false
          },
          {
            value: "satelite",
            viewValue: languageJson["descriptor"]["basemaps"]["types"]["satelite"][language],
            visible: false
          },
          {
            value: "relevo",
            viewValue: languageJson["descriptor"]["basemaps"]["types"]["relevo"][language],
            visible: false
          },

        ]
      }],
      limits: [{
        id: "limits",
        types: [
          {
            value: "municipios_goias",
            Viewvalue: languageJson["descriptor"]["limits"]["types"]["municipios_goias"][language],
            visible: true,
            layer_limits: true,
            source: 'ows',
            opacity: 1
          }
        ],
        selectedType: "municipios_goias"
      }]
    };

    response.send(result);
    response.end();
  };


  Controller.titles = function (request, response) {

    var language = request.param('lang')

    var jsonPath = path.join(__dirname, '..', 'assets', 'lang', 'language.json');
    var languageFile = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    var dialogJsonMiniReport = languageFile["mini_report_utfgrid"];
    var keysUTF = {};

    Object.keys(dialogJsonMiniReport).forEach(function (key, index) {
      keysUTF[key] = key[language]
    });

    var resultUTF = {};
    Object.keys(keysUTF).forEach(function (key, index) {

      if (dialogJsonMiniReport[key].hasOwnProperty("pt-br")) {
        resultUTF[key] = dialogJsonMiniReport[key][language]
      }
    });

    var jsonLayerBox = languageFile["layer_box"]
    var keysLayerBox = {};

    Object.keys(jsonLayerBox).forEach(function (key, index) {
      keysLayerBox[key] = key[language]
    });

    var resultLayerBox = {};
    Object.keys(keysLayerBox).forEach(function (key, index) {

      if (jsonLayerBox[key].hasOwnProperty("pt-br")) {
        resultLayerBox[key] = jsonLayerBox[key][language]
      }
    });

    var result = {
      legendTitle: languageFile["legends_box_title"][language],
      utfgrid: resultUTF,
      layer_box: resultLayerBox,
      descriptor: languageFile["descriptor"]

    };

    response.send(result);
    response.end();
  };

  Controller.marker = function (request, response) {
    var queryResult = request.queryResult;

    features = []

    for (var i = 0; i < queryResult.length; i++) {

      geometry = JSON.parse(queryResult[i].geojson)
      delete queryResult[i].geojson
      delete queryResult[i].geom

      features.push({
        "type": "Feature",
        "geometry": geometry,
        "properties": queryResult[i]

      })

    }

    response.send({
      "type": "FeatureCollection",
      "features": features
    })

    response.end();
  };

  Controller.textreport = function (request, response) {
    var language = request.param('lang')

    var jsonPath = path.join(__dirname, '..', 'assets', 'lang', 'language.json');
    var languageFile = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    var dialogJson = languageFile["dialog_relatorio"];

    var keys = {};

    Object.keys(dialogJson).forEach(function (key, index) {
      keys[key] = key
    });

    var result = {};
    Object.keys(keys).forEach(function (key, index) {

      if (dialogJson[key].hasOwnProperty("pt-br")) {
        result[key] = dialogJson[key][language]
      } else {
        result[key] = dialogJson[key]
        Object.keys(dialogJson[key]).forEach(function (key2, index) {
          result[key][key2] = dialogJson[key][key2][language]
        });
      }
    });

    response.send(result);
    response.end();

  };


  return Controller;
};