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
              regionFilter: false,
              layerfilter: "data = (select max(data) from municipios_casos)",
              source: 'ows',
              opacity: 0.8,
              order: 3
            }]
          },
          {
            id: "casos_bairro",
            label: languageJson["descriptor"]["informacoes"]["layers"]["casos_bairro"]["label"][language],
            visible: false,
            selectedType: "casos_por_bairro_covid",
            showTypes: true,
            types: [{
              value: "casos_por_bairro_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["casos_bairro"]["types"]["casos_por_bairro_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3,
              timeLabel: languageJson["descriptor"]["informacoes"]["layers"]["casos_bairro"]["types"]["casos_por_bairro_covid"]["timelabel"][language],
              timeSelected: "cd_geocmu='52'",
              timeHandler: "msfilter",
              times: [
                {
                value: "cd_geocmu='52'",
                Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["casos_bairro"]["types"]["casos_por_bairro_covid"]["default_placeholder"][language]
              },
              {
                value: "cd_geocmu='5208707' AND data_ultima_atualizacao = (select max(data_ultima_atualizacao) from v_casos_bairros where cd_geocmu = '5208707')",
                Viewvalue: "Goiânia"
              },
              {
                value: "cd_geocmu='5201405' AND data_ultima_atualizacao = (select max(data_ultima_atualizacao) from v_casos_bairros where cd_geocmu = '5201405')",
                Viewvalue: "Aparecida de Goiânia"
              }
              ]
            }]
          },
          {
            id: "urban_traffic",
            label: languageJson["descriptor"]["informacoes"]["layers"]["urban_traffic"]["label"][language],
            visible: false,
            selectedType: "urban_traffic_real_time",
            types: [{
              value: "urban_traffic_real_time",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["urban_traffic"]["types"]["urban_traffic_real_time"]["view_value"][language],
              source: 'external',
              // url: 'https://mt1.google.com/vt?lyrs=h@159000000,traffic|seconds_into_week:-1&style=3&x={x}&y={y}&z={z}',
              url: 'https://mt0.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}',
              legendUrl: 'assets/legends/legend-trafficgoogle-br.png',
              opacity: 0.8,
              order: 3
            }]
          },
          {
            id: "indice_vulnerabilidade",
            label: languageJson["descriptor"]["informacoes"]["layers"]["indice_vulnerabilidade"]["label"][language],
            visible: false,
            showTypes: true,
            selectedType: "indice_vunerabilidade_ao_covid",
            types: [{
              value: "indice_vunerabilidade_ao_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["indice_vulnerabilidade"]["types"]["indice_vunerabilidade_ao_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "indice_vunerabilidade_ao_covid_responsave",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["indice_vulnerabilidade"]["types"]["indice_vunerabilidade_ao_covid_responsave"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "indice_vunerabilidade_ao_covid_moradia",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["indice_vulnerabilidade"]["types"]["indice_vunerabilidade_ao_covid_moradia"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "indice_vunerabilidade_ao_covid_idosos",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["indice_vulnerabilidade"]["types"]["indice_vunerabilidade_ao_covid_idosos"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "indice_vunerabilidade_ao_covid_infraestrutura",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["indice_vulnerabilidade"]["types"]["indice_vunerabilidade_ao_covid_infraestrutura"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "indice_vunerabilidade_ao_covid_educacao",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["indice_vulnerabilidade"]["types"]["indice_vunerabilidade_ao_covid_educacao"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "indice_vunerabilidade_ao_covid_demografia",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["indice_vulnerabilidade"]["types"]["indice_vunerabilidade_ao_covid_demografia"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            }
          ]
          },
          {
            id: "doencas_respiratorias",
            label: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["label"][language],
            visible: false,
            selectedType: "doencas_respiratorias_2015_2019_abril_covid",
            types: [
              {
                value: "doencas_respiratorias_2015_2019_ano_total_covid_",
                Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_ano_total_covid_"]["view_value"][language],
                regionFilter: true,
                source: 'ows',
                opacity: 0.8,
                order: 3
              },
              {
              value: "doencas_respiratorias_2015_2019_janeiro_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_janeiro_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "doencas_respiratorias_2015_2019_fevereiro_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_fevereiro_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "doencas_respiratorias_2015_2019_marco_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_marco_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "doencas_respiratorias_2015_2019_abril_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_abril_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "doencas_respiratorias_2015_2019_maio_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_maio_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "doencas_respiratorias_2015_2019_junho_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_junho_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "doencas_respiratorias_2015_2019_julho_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_julho_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "doencas_respiratorias_2015_2019_agosto_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_agosto_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "doencas_respiratorias_2015_2019_setembro_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_setembro_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "doencas_respiratorias_2015_2019_outubro_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_outubro_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "doencas_respiratorias_2015_2019_novembro_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_novembro_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "doencas_respiratorias_2015_2019_dezembro_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["doencas_respiratorias"]["types"]["doencas_respiratorias_2015_2019_dezembro_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
          ]
          },
          {
            id: "casos_tuberculose",
            label: languageJson["descriptor"]["informacoes"]["layers"]["casos_tuberculose"]["label"][language],
            visible: false,
            selectedType: "casos_tuberculose_2019_covid",
            types: [
              {
                value: "casos_tuberculose_2015_covid",
                Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["casos_tuberculose"]["types"]["casos_tuberculose_2015_covid"]["view_value"][language],
                regionFilter: true,
                source: 'ows',
                opacity: 0.8,
                order: 3
              },
              {
              value: "casos_tuberculose_2016_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["casos_tuberculose"]["types"]["casos_tuberculose_2016_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "casos_tuberculose_2017_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["casos_tuberculose"]["types"]["casos_tuberculose_2017_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "casos_tuberculose_2018_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["casos_tuberculose"]["types"]["casos_tuberculose_2018_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "casos_tuberculose_2019_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["casos_tuberculose"]["types"]["casos_tuberculose_2019_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            },
            {
              value: "casos_tuberculose_mediana_covid",
              Viewvalue: languageJson["descriptor"]["informacoes"]["layers"]["casos_tuberculose"]["types"]["casos_tuberculose_mediana_covid"]["view_value"][language],
              regionFilter: true,
              source: 'ows',
              opacity: 0.8,
              order: 3
            }
          ]
          }
          ]
        },
        {
          id: "servicos",
          label: languageJson["descriptor"]["servicos"]["label"][language],
          group_expanded: false,
          layers: [
            // {
            //   id: "pharmacy_supermarket_hospital",
            //   label: languageJson["descriptor"]["servicos"]["layers"]["pharmacy_supermarket_hospital"]["label"][language],
            //   visible: false,
            //   selectedType: "pharmacy_supermarket_hospital_covid",
            //   types: [{
            //     value: "pharmacy_supermarket_hospital_covid",
            //     Viewvalue: languageJson["descriptor"]["servicos"]["layers"]["pharmacy_supermarket_hospital"]["types"]["pharmacy_supermarket_hospital_covid"]["view_value"][language],
            //     url: 'service/map/marker?layer=hospitais&filter=1=1',
            //     iconUrl: 'assets/markers/hospital.png',
            //     source: 'geojson',
            //     opacity: 0.8,
            //     order: 1
            //   }]
            // },
            {
              id: "hospitais",
              label: languageJson["descriptor"]["servicos"]["layers"]["hospitais"]["label"][language],
              visible: false,
              selectedType: "go_hospitais_datasus",
              types: [{
                value: "go_hospitais_datasus",
                Viewvalue: languageJson["descriptor"]["servicos"]["layers"]["hospitais"]["types"]["go_hospitais_datasus"]["view_value"][language],
                url: 'service/map/marker?layer=go_hospitais_datasus&filter=1=1',
                iconUrl: 'assets/markers/hospital.png',
                source: 'geojson',
                opacity: 0.8,
                order: 1
              }]
            },
            {
              id: "go_leitos_mun_clinicos_uti",
              label: languageJson["descriptor"]["servicos"]["layers"]["go_leitos_mun_clinicos_uti"]["label"][language],
              visible: false,
              selectedType: "go_leitos_mun_clinica_covid",
              types: [{
                value: "go_leitos_mun_clinica_covid",
                Viewvalue: languageJson["descriptor"]["servicos"]["layers"]["go_leitos_mun_clinicos_uti"]["types"]["go_leitos_mun_clinica_covid"]["view_value"][language],
                regionFilter: false,
                source: 'ows',
                opacity: 0.8,
                order: 3
              },
              {
                value: "go_leitos_mun_uti_covid",
                Viewvalue: languageJson["descriptor"]["servicos"]["layers"]["go_leitos_mun_clinicos_uti"]["types"]["go_leitos_mun_uti_covid"]["view_value"][language],
                regionFilter: false,
                source: 'ows',
                opacity: 0.8,
                order: 3
              }]
            },
            {
              id: "unidades_basicas",
              label: languageJson["descriptor"]["servicos"]["layers"]["unidades_basicas"]["label"][language],
              visible: false,
              showTypes: true,
              selectedType: "uni_basicas_goiania",
              types: [{
                value: "uni_basicas_goiania",
                Viewvalue: languageJson["descriptor"]["servicos"]["layers"]["unidades_basicas"]["types"]["uni_basicas_goiania"]["view_value"][language],
                url: 'service/map/marker?layer=uni_basicas_goiania&filter=1=1',
                iconUrl: 'assets/markers/unidade_basica.png',
                source: 'geojson',
                opacity: 0.8,
                order: 1
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
                url: 'service/map/marker?layer=vacinacao_gripe&filter=1=1',
                iconUrl: 'assets/markers/icon.png',
                source: 'geojson',
                opacity: 0.8,
                order: 1
              }]
            },
          ]
        },
        {
          id: "geoinformacoes",
          label: languageJson["descriptor"]["geoinformacoes"]["label"][language],
          group_expanded: false,
          layers: [
            {
              id: "qtd_populacional",
              label: languageJson["descriptor"]["geoinformacoes"]["layers"]["qtd_populacional"]["label"][language],
              visible: false,
              selectedType: "covid19_ibge_populacao",
              types: [{
                value: "covid19_ibge_populacao",
                Viewvalue: languageJson["descriptor"]["geoinformacoes"]["layers"]["qtd_populacional"]["types"]["covid19_ibge_populacao"]["view_value"][language],
                regionFilter: true,
                source: 'ows',
                opacity: 0.8,
                order: 3
              }]
            },
            {
              id: "idh_municipios",
              label: languageJson["descriptor"]["geoinformacoes"]["layers"]["idh_municipios"]["label"][language],
              visible: false,
              selectedType: "idh_por_municipio_goiano_covid",
              types: [{
                value: "idh_por_municipio_goiano_covid",
                Viewvalue: languageJson["descriptor"]["geoinformacoes"]["layers"]["idh_municipios"]["types"]["idh_por_municipio_goiano_covid"]["view_value"][language],
                regionFilter: false,
                source: 'ows',
                opacity: 0.8,
                order: 3
              }]
            },
            {
              id: "faixa_etaria",
              label: languageJson["descriptor"]["geoinformacoes"]["layers"]["faixa_etaria"]["label"][language],
              visible: false,
              selectedType: "pop_faixa_etaria_menor19_covid",
              types: [{
                value: "pop_faixa_etaria_menor19_covid",
                Viewvalue: languageJson["descriptor"]["geoinformacoes"]["layers"]["faixa_etaria"]["types"]["pop_faixa_etaria_menor19_covid"]["view_value"][language],
                regionFilter: true,
                source: 'ows',
                opacity: 0.8,
                order: 3
              },
              {
                value: "pop_faixa_etaria_20_a_29_covid",
                Viewvalue: languageJson["descriptor"]["geoinformacoes"]["layers"]["faixa_etaria"]["types"]["pop_faixa_etaria_20_a_29_covid"]["view_value"][language],
                regionFilter: true,
                source: 'ows',
                opacity: 0.8,
                order: 3
              },
              {
                value: "pop_faixa_etaria_30_a_39_covid",
                Viewvalue: languageJson["descriptor"]["geoinformacoes"]["layers"]["faixa_etaria"]["types"]["pop_faixa_etaria_30_a_39_covid"]["view_value"][language],
                regionFilter: true,
                source: 'ows',
                opacity: 0.8,
                order: 3
              },
              {
                value: "pop_faixa_etaria_40_a_49_covid",
                Viewvalue: languageJson["descriptor"]["geoinformacoes"]["layers"]["faixa_etaria"]["types"]["pop_faixa_etaria_40_a_49_covid"]["view_value"][language],
                regionFilter: true,
                source: 'ows',
                opacity: 0.8,
                order: 3
              },
              {
                value: "pop_faixa_etaria_50_a_59_covid",
                Viewvalue: languageJson["descriptor"]["geoinformacoes"]["layers"]["faixa_etaria"]["types"]["pop_faixa_etaria_50_a_59_covid"]["view_value"][language],
                regionFilter: true,
                source: 'ows',
                opacity: 0.8,
                order: 3
              },
              {
                value: "pop_faixa_etaria_acima_60_covid",
                Viewvalue: languageJson["descriptor"]["geoinformacoes"]["layers"]["faixa_etaria"]["types"]["pop_faixa_etaria_acima_60_covid"]["view_value"][language],
                regionFilter: true,
                source: 'ows',
                opacity: 0.8,
                order: 3
              }
              ]
            },
            {
              id: "rendimento_mensal",
              label: languageJson["descriptor"]["geoinformacoes"]["layers"]["rendimento_mensal"]["label"][language],
              visible: false,
              selectedType: "rendimento_mensal_domicilio_covid",
              types: [{
                value: "rendimento_mensal_domicilio_covid",
                Viewvalue: languageJson["descriptor"]["geoinformacoes"]["layers"]["rendimento_mensal"]["types"]["rendimento_mensal_domicilio_covid"]["view_value"][language],
                regionFilter: false,
                source: 'ows',
                opacity: 0.8,
                order: 3
              }]
            },
            {
              id: "hab_censitaria",
              label: languageJson["descriptor"]["geoinformacoes"]["layers"]["hab_censitaria"]["label"][language],
              visible: false,
              selectedType: "hab_unidade_censitaria_covid",
              types: [{
                value: "hab_unidade_censitaria_covid",
                Viewvalue: languageJson["descriptor"]["geoinformacoes"]["layers"]["hab_censitaria"]["types"]["hab_unidade_censitaria_covid"]["view_value"][language],
                regionFilter: false,
                source: 'ows',
                opacity: 0.8,
                order: 3
              }]
            },
            // {
            //   id: "esgotos_domiclios",
            //   label: languageJson["descriptor"]["geoinformacoes"]["layers"]["esgotos_domiclios"]["label"][language],
            //   visible: false,
            //   selectedType: "esgoto_domicilios_covid",
            //   types: [{
            //     value: "esgoto_domicilios_covid",
            //     Viewvalue: languageJson["descriptor"]["geoinformacoes"]["layers"]["esgotos_domiclios"]["types"]["esgoto_domicilios_covid"]["view_value"][language],
            //     regionFilter: false,
            //     source: 'ows',
            //     opacity: 0.8,
            //     order: 3
            //   }]
            // }
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
            value: "mapbox",
            viewValue: languageJson["descriptor"]["basemaps"]["types"]["mapbox"][language],
            visible: false
          },
          {
            value: "satelite",
            viewValue: languageJson["descriptor"]["basemaps"]["types"]["satelite"][language],
            visible: false
          }

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

  Controller.controls = function (request, response) {
    var language = request.param('lang');

    var jsonPath = path.join(__dirname, '..', 'assets', 'lang', 'language.json');
    var languageFile = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    var controlsJson = languageFile["controls"];

    var result = {};

    Object.keys(controlsJson).forEach(function (key, index) {
      result[key] = controlsJson[key][language];
    });

    response.send(result);
    response.end();

  };


  return Controller;
};