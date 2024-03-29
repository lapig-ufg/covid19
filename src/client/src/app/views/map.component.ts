import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, HostListener, Injectable, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { MatIconRegistry } from '@angular/material/icon';

import * as OlExtent from 'ol/extent.js';
import GeoJSON from 'ol/format/GeoJSON';
import { defaults as defaultInteractions } from 'ol/interaction';
import OlTileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import OlMap from 'ol/Map';
import Overlay from 'ol/Overlay.js';
import * as OlProj from 'ol/proj';
import BingMaps from 'ol/source/BingMaps';
import TileWMS from 'ol/source/TileWMS';
import UTFGrid from 'ol/source/UTFGrid.js';
import Icon from 'ol/style/Icon.js';
import VectorSource from 'ol/source/Vector';
import OlXYZ from 'ol/source/XYZ';
import Circle from 'ol/style/Circle.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import TileGrid from 'ol/tilegrid/TileGrid';
import * as _ol_TileUrlFunction_ from 'ol/tileurlfunction.js';
import OlView from 'ol/View';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { MetadataComponent } from './metadata/metadata.component';
import CropFilter from 'ol-ext/filter/Crop';
import MaskFilter from 'ol-ext/filter/Mask';
import MultiPolygon from 'ol/geom/MultiPolygon';
import { defaults as defaultControls, Control, Attribution } from 'ol/control';
import { Router } from '@angular/router';
import { google } from "google-maps";
import { DataSource } from '@angular/cdk/table';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleAnalyticsService } from '../services/google-analytics.service';
import { HelpComponent } from "./help/help.component";
import { RestrictedAreaAccessComponent } from "./restricted-area-access/restricted-area-access.component";
import { RestrictedAreaFormComponent } from "./restricted-area-form/restricted-area-form.component";
import * as moment from 'moment';

import { Table } from 'primeng/table';

import logos from './logos';
import tendencias from './tendencias';
import { BedsComponent } from "./beds/beds.component";
import { NoteComponent } from "./note/note.component";
import { MatTableDataSource } from "@angular/material/table";
import { saveAs } from 'file-saver';
import * as jsPDF from 'jspdf';
import { ProjectionsComponent } from "./projections/projections.component";

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { DialogChartsComponent } from "./dialog-charts/dialog-charts.component";
import { DocsComponent } from "./docs/docs.component";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

declare let html2canvas: any;

let SEARCH_URL = '/service/map/search';
let PARAMS = new HttpParams({
  fromObject: {
    format: 'json'
  }
});

export interface TableElement {
  rank: number;
  nome: number;
  confirmados: number;
}

@Injectable()
export class SearchService {
  constructor(private http: HttpClient) { }

  search(term: string) {
    if (term === '') {
      return of([]);
    }

    return this.http
      .get(SEARCH_URL, { params: PARAMS.set('key', term) })
      .pipe(map(response => response));
  }
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  providers: [SearchService],
  styleUrls: ['./map.component.css']

})


export class MapComponent implements OnInit {

  @ViewChild(Table, { static: false }) dt: Table;
  map: OlMap;
  layers: Array<TileWMS>;
  tileGrid: TileGrid;
  projection: OlProj;
  currentZoom: Number;
  regionsLimits: any;
  dataSeries: any;
  dataProjSeries: any;
  tendeciaSeries: any;
  dataStates: any;
  dataCities: any;
  dataBrasil: any;
  optionsBrasil: any;
  dataSource: any;
  neighborhoodsCharts: any;
  deathsCharts: any;

  chartResultCities: any;
  chartResultCitiesIllegalAPP: any;
  chartResultCitiesIllegalRL: any;
  optionsStates: any
  textSummary: any

  changeTabSelected = "";
  viewWidth = 600;
  viewWidthMobile = 350;
  chartRegionScale: boolean;

  trafficgoogle: any;
  exportColumnsCities: any[];
  exportColumnsBairros: any[];
  exportColumnsBairrosDeaths: any[];
  textOnDialog: any;
  mapbox: any;
  satelite: any;
  estradas: any;
  relevo: any;
  landsat: any;
  descriptor: any;
  valueRegion: any;
  googlemaps: any
  regionFilterDefault: any;
  urls: any;
  dataExtent: any;

  selectedBairroTime: any;
  selectedBairroObitosTime: any;
  searching = false;
  searchFailed = false;
  msFilterRegion = '';
  selectRegion: any;

  region_geom: any;
  regionSource: any;
  regionTypeFilter: any;

  defaultRegion: any;

  statePreposition = [];

  statistics_county: any;

  avoidMarkers = [];

  layersNames = [];
  layersTypes = [];
  basemapsNames = [];
  limitsNames = [];
  LayersTMS = {};
  limitsTMS = {};

  collapseCharts = false;
  collapseChartsMobile: boolean;
  collapseLayer = false;

  isFilteredByCity = false;
  isFilteredByState = false;
  selectedIndex: any;
  collapseLegends = false;

  clickable = true;
  clickableTitle: any;

  infodata: any;
  infomarker: any;
  infobairro: any;
  infobairroObitos: any;
  infoprojecao: any;
  infoTendencias: any;
  infoTemperatures: any;
  infodataMunicipio: any;
  fieldPointsStop: any;
  utfgridsource: UTFGrid;
  utfgridlayer: OlTileLayer;
  utfgridBairro: UTFGrid;
  utfgridBairroObitos: UTFGrid;
  utfgridlayerBairro: OlTileLayer;
  utfgridlayerBairroObitos: OlTileLayer;
  utfgridProjecao: UTFGrid;
  utfgridTendencias: UTFGrid;
  utfgridTemperatures: UTFGrid;
  utfgridlayerProjecao: OlTileLayer;
  utfgridlayerTendencias: OlTileLayer;
  utfgridlayerTemperatures: OlTileLayer;
  infoOverlay: Overlay;
  datePipe: DatePipe;
  dataForDialog = {} as any;

  keyForClick: any;
  keyForPointer: any;
  currentData: any;
  language: any;

  titlesLayerBox: any;
  minireportText: any;
  descriptorText: any;
  controls: any;

  bntStylePOR: any;
  bntStyleENG: any;

  styleSelected: any;
  styleDefault: any;

  svgLoading = "/assets/img/coronavirus_icon.svg";

  /** Variables for upload shapdefiles **/
  layerFromUpload: any = {
    label: null,
    layer: null,
    checked: false,
    visible: null,
    loading: false,
    dragArea: true,
    strokeColor: '#2224ba',
  };

  innerHeigth: any;
  innerWidth: any;

  showStatistics: boolean;
  showDrawer: boolean;

  summary: any;
  lastUpdate: any;

  restrictedArea: boolean;
  user: any;

  msg: any;
  display: boolean;
  team: any;
  dates: any;
  datesProjections: any;
  datesTemperatures: any;

  showSlider: boolean;
  showProjections: boolean;
  showTemperatures: boolean;
  projectionsLayers: any;
  temperaturesLayers: any;
  selectedProjectionLayer: any;
  selectedTemperatureLayer: any;
  urlLegendProjections: string
  urlLegendTemperatures: string
  labelProjections: any;
  labelTemperatures: any;
  dataMS: any;

  dataSourceNeighbor: TableElement[];
  displayedColumnsNeighbor = [];


  dataSourceDeaths: TableElement[];
  displayedColumnsDeaths = [];

  dataSourceCities: TableElement[];
  displayedColumnsCities = [];

  rangeValuesChartCases: number[];

  @ViewChild("drawer", { static: false }) drawer: ElementRef;
  @ViewChild("map", { static: false }) mpref: ElementRef;
  selectedConfirmedDate: any;
  tend: any;

  constructor(
    private http: HttpClient,
    private _service: SearchService,
    public dialog: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public googleAnalyticsService: GoogleAnalyticsService,
    private router: Router,
    private elementRef: ElementRef,
    private decimalPipe: DecimalPipe
  ) {

    this.projection = OlProj.get('EPSG:900913');
    this.currentZoom = 7.6;
    this.layers = [];

    this.dataSeries = { timeseries: { label: "", chartResult: [] } };
    this.dataProjSeries = { timeseries: { label: "", chartResult: [] } };
    this.tendeciaSeries = { timeseries: { label: "", chartResult: [] } };
    this.dataStates = {};


    this.clickableTitle = 'Informações não disponíveis';

    this.chartResultCities = {
      split: []
    };
    this.textSummary = {};

    this.infomarker = {};
    this.infobairro = {}
    this.infobairroObitos = {};
    this.infoprojecao = {};
    this.infoTendencias = {};
    this.infoTemperatures = {};
    this.defaultRegion = {
      nome: 'Goiás',
      area_mun: 1547.26991096032,
      estado: 'GOIÁS',
      uf: 'GO',
      cd_geocmu: '52'
    };
    this.selectRegion = this.defaultRegion;

    this.textOnDialog = {};
    this.controls = {};

    this.currentData = "";

    this.avoidMarkers = ["go_hospitais_datasus", "vacinacao_gripe", "uni_basicas_goiania"];

    this.neighborhoodsCharts = {}
    this.deathsCharts = {};

    this.optionsStates = {};
    this.statistics_county = { result: {}, text: {} };
    this.valueRegion = '';

    this.changeTabSelected = "";

    this.urls = [
      'https://o5.lapig.iesa.ufg.br/ows',
      'https://o6.lapig.iesa.ufg.br/ows',
      'https://o7.lapig.iesa.ufg.br/ows',
      'https://o8.lapig.iesa.ufg.br/ows'
      // "http://localhost:5501/ows"
    ];

    this.tileGrid = new TileGrid({
      extent: this.projection.getExtent(),
      resolutions: this.getResolutions(this.projection),
      tileSize: 512
    });

    this.descriptor = {
      groups: []
    };
    this.datePipe = new DatePipe('pt-BR');
    this.language = 'pt-br';

    this.styleSelected = {
      'background-color': '#ec7a18'
    };

    this.styleDefault = {
      'background-color': '#707070'
    };

    this.selectedConfirmedDate = ''
    this.selectedBairroTime = "(select max(data_ultima_atualizacao) from v_casos_bairros)"
    this.selectedBairroObitosTime = "(select max(data_ultima_atualizacao) from v_obitos_bairros)"
    this.bntStyleENG = this.styleDefault;
    this.bntStylePOR = this.styleSelected;

    this.optionsBrasil = {};
    this.dataBrasil = {};

    this.updateCharts();
    this.chartRegionScale = true;
    this.titlesLayerBox = {};
    this.minireportText = {};
    this.updateControls();
    this.updateSource();
    this.updateTexts();
    this.updateTeam();

    this.showStatistics = true;
    this.showDrawer = false;
    this.dataSource = {};
    this.summary = {};
    this.lastUpdate = {};
    this.updateSummary();

    this.restrictedArea = false;
    this.user = {};
    this.display = false;
    this.team = {};

    this.dates = [];
    this.getDates();
    this.showSlider = false;
    this.datesProjections = [];
    this.datesTemperatures = [];
    this.showProjections = false;
    this.showTemperatures = false;
    this.projectionsLayers = [
      { label: 'Confirmados', value: 'projecao_luisa_confirmados' },
      { label: 'Recuperados', value: 'projecao_luisa_recuperados' },
      { label: 'Infectados', value: 'projecao_luisa_infectados' },
      { label: 'Hospitalizados', value: 'projecao_luisa_hospitalizados' }
    ];
    this.selectedProjectionLayer = 'projecao_luisa_confirmados';
    this.selectedTemperatureLayer = 'clima_temperatura_em_goias';
    this.labelProjections = 'Confirmados';
    this.labelTemperatures = '';
    this.getDatesProjections();
    this.getDatesTemperatures();
    this.dataMS = {};
    this.getDataMS();
    this.tend = tendencias;
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap(term =>
        this._service.search(term).pipe(
          tap(() => (this.searchFailed = false)),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searching = false))
    );

  formatter = (x: { text: string }) => x.text;

  onCityRowSelect(event) {

    let name = event.data.nome;
    let cod = event.data.geocodigo;


    let achou = false
    for (let layer of this.layersTypes) {
      if (layer.value == "casos_por_bairro_covid") {
        for (let time of layer.times) {
          let str = time.value + ""
          if (str.includes(cod)) {
            layer.timeSelected = time.value
            achou = true
          }
        }
      }
    }

    if (achou) {
      let bairro = this.layersNames.find(element => element.id === 'casos_bairro');
      let tipo = bairro.types.find(element => element.value === 'casos_por_bairro_covid')

      this.changeVisibility(bairro, { checked: true });
      this.zoomToCityOnTypesLayer(tipo)

    } else {

      this.http.get(SEARCH_URL, { params: PARAMS.set('key', name) }).subscribe(result => {

        let ob = result[0];
        this.updateRegion(ob);
        let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
        this.changeVisibility(p, { checked: false });

        let urban_traffic = this.layersNames.find(element => element.id === 'urban_traffic');
        this.changeVisibility(urban_traffic, { checked: true });

        this.handleInteraction();
        this.infodata = null
      });
    }



  }

  private selectedTimeFromLayerType(layerName) {
    for (let layer of this.layersTypes) {
      if (layer.value == layerName) {
        for (let time of layer.times) {
          if (time.value == layer.timeSelected) {
            return time;
          }
        }
      }
    }

    return undefined;
  }

  private refreshTable() {

    let citiesUrl = '/service/indicators/cities' + this.getServiceParams();
    this.exportColumnsCities = [];
    this.http.get(citiesUrl).subscribe(citiesResult => {

      this.chartResultCities = citiesResult;

      let headers = this.chartResultCities.title.split('?');
      let properties = this.chartResultCities.properties.split('?');

      this.chartResultCities.split = [];
      for (let i = 0; i < headers.length; i++) {
        this.chartResultCities.split.push({
          header: headers[i],
          field: properties[i]
        })
      }

      this.exportColumnsCities = this.chartResultCities.split.map(col => ({ title: col.header, dataKey: col.field }));

      this.dt.reset();
    });
  }

  private getServiceParams() {
    let params = [];

    params.push('cd_geocmu=' + this.selectRegion.cd_geocmu);

    params.push('lang=' + this.language);

    let urlParams = '?' + params.join('&');


    return urlParams;
  }

  private createCropFilter() {

    if (this.descriptor.maskUrl) {
      this.http.get(this.descriptor.maskUrl).subscribe(maskGeoJson => {
        var features = new GeoJSON().readFeatures(maskGeoJson, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });

        var filter = new MaskFilter({ feature: features[0], inner: false, fill: new Fill({ color: [0, 0, 0, 0.55] }) })
        if (this.descriptor.maskOption == 'crop') {
          filter = new CropFilter({ feature: features[0], inner: false })
        }

        this.map.addFilter(filter)

      });
    }
  }

  private updateExtent() {
    let extenUrl = '/service/map/extent' + this.getServiceParams();

    // if (this.selectRegion.type != "") {
    var map = this.map;
    this.http.get(extenUrl).subscribe(extentResult => {
      var features = new GeoJSON().readFeatures(extentResult, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857"
      });

      this.regionSource = this.regionsLimits.getSource();
      this.regionSource.clear();
      this.regionSource.addFeature(features[0]);

      var extent = features[0].getGeometry().getExtent();
      map.getView().fit(extent, { duration: 1000 });

      this.selectRegion.area_mun = extentResult["area_mun"];
    });
    // }
  }

  changeTab(event) {
    this.changeTabSelected = event.tab.textLabel;

    if (event.tab.textLabel == "Série Temporal" || event.tab.textLabel == "Timeseries") {
      this.viewWidth = this.viewWidth + 1;
      this.viewWidthMobile = this.viewWidthMobile + 1;
      this.chartRegionScale = true;

      let uso_terra = this.layersNames.find(element => element.id === 'terraclass');
      uso_terra.visible = false;


    } else if (event.tab.textLabel == "Uso do Solo" || event.tab.textLabel == "Land Use and Land Cover") {
      this.viewWidth = this.viewWidth + 1;
      this.viewWidthMobile = this.viewWidthMobile + 1;
    }
    this.googleAnalyticsService.eventEmitter("changeTab", "charts", this.changeTabSelected);

  }

  changeLanguage(lang) {

    let zoom = this.map.getView().getZoom();

    if (this.language != (lang)) {
      this.language = lang;

      this.setStylesLangButton();
      this.updateTexts();
      this.updateCharts();
      this.updateDescriptor();
      this.updateSource();
      this.updateControls();
      this.updateTeam();
    }

    this.googleAnalyticsService.eventEmitter("changeLanguage", "lang", lang);

  }

  private setStylesLangButton() {

    if (this.language == 'pt-br') {
      this.bntStyleENG = this.styleDefault;
      this.bntStylePOR = this.styleSelected;
    }
    else {
      this.bntStyleENG = this.styleSelected;
      this.bntStylePOR = this.styleDefault;
    }

  }

  private updateTexts() {
    let titlesUrl = '/service/map/titles' + this.getServiceParams();

    this.http.get(titlesUrl).subscribe(titlesResults => {

      this.titlesLayerBox = titlesResults['layer_box'];
      this.titlesLayerBox.legendTitle = titlesResults['legendTitle'];
      this.minireportText = titlesResults['utfgrid'];
      this.descriptorText = titlesResults['descriptor'];

    });

    let sumBoxURL = '/service/summary/texts' + this.getServiceParams();

    this.http.get(sumBoxURL).subscribe(result => {
      this.textSummary = result;

      let sp = this.textSummary.title.split("?")
      let tmp = ''

      if (this.selectRegion.cd_geocmu == '52') {
        if (this.language == 'pt-br') {
          tmp = "Estado"
        }
        else {
          tmp = "State"
        }
      } else {
        if (this.language == 'pt-br') {
          tmp = "Município"
        }
        else {
          tmp = "Municipality"
        }
      }
      if (this.selectRegion.cd_geocmu == '5300108') {
        let tmp;
        if (this.language == 'pt-br') {
          tmp = "Distrito Federal"
        }
        else {
          tmp = "Federal Disctrict"
        }
        this.textSummary.title = sp[0] + tmp
      } else {
        this.textSummary.title = sp[0] + tmp + sp[1] + this.selectRegion.nome
      }

    });


  }

  private transformDate(myDate) {
    if (this.language == 'pt-br') {
      return this.datePipe.transform(myDate, 'dd/MM/yyyy');
    } else {
      return this.datePipe.transform(myDate, 'MM/dd/yyyy');
    }
  }

  private updateSource() {
    let sourceUrl = '/service/indicators/source' + this.getServiceParams();

    this.http.get(sourceUrl).subscribe(result => {
      this.dataSource = result;
    });

  }

  private updateControls() {
    let sourceUrl = '/service/map/controls' + this.getServiceParams();

    this.http.get(sourceUrl).subscribe(result => {
      this.controls = result;
    });

  }

  private updateTeam() {
    let sourceUrl = '/service/indicators/team' + this.getServiceParams();

    this.http.get(sourceUrl).subscribe(result => {
      this.team = result;
    });

  }

  getDates(url = '/service/indicators/dates') {

    let sourceUrl = url + this.getServiceParams();

    this.http.get(sourceUrl).subscribe(result => {
      this.dates = result;
    });

  }

  getDatesProjections(url = '/service/indicators/datesProjections') {

    let sourceUrl = url + this.getServiceParams();

    this.http.get(sourceUrl).subscribe(result => {
      this.datesProjections = result;
    });

  }

  getDatesTemperatures(url = '/service/indicators/datesClima') {

    let sourceUrl = url + this.getServiceParams();

    this.http.get(sourceUrl).subscribe(result => {
      this.datesTemperatures = result;
    });

  }

  getDataMS() {
    this.http.get('/service/indicators/summaryBrasil').subscribe(result => {
      this.dataMS = result;
      this.dataMS.recuperados = this.dataMS.recuperados.replace(',', '')
      this.dataMS.recuperados = this.dataMS.recuperados.replace(',', '')
      this.dataMS.recuperados = this.dataMS.recuperados.replace(',', '')
    });
  }

  private updateCharts() {

    let timeseriesUrl = '/service/indicators/timeseries' + this.getServiceParams();

    this.http.get(timeseriesUrl).subscribe(result => {

      this.dataSeries = result;

      this.rangeValuesChartCases = [0, this.dataSeries.timeseries.chartResult[0].dataResult.labels.length - 1];

      for (let graphic of this.dataSeries.timeseries.chartResult) {

        let y = [{
          ticks: {
            beginAtZero: true,
            autoskip: true,
            autoSkipPadding: 20,
            callback: function (value) {
              return value.toLocaleString('de-DE');
            }
          }
        }]

        graphic.options.scales.yAxes = y;

        let x = [{
          ticks: {
            autoskip: false,
            autoSkipPadding: 20
          }
        }]

        graphic.options.scales.xAxes = x;

        graphic.options.legend.onHover = function (event) {
          event.target.style.cursor = 'pointer';
        };

        // graphic.options.legend.onHover = function (event) {
        //   event.target.style.cursor = 'pointer';
        //   graphic.options.legend.labels.fontColor = '#0335fc';
        // };

        // graphic.options.legend.onLeave = function (event) {
        //   event.target.style.cursor = 'default';
        //   graphic.options.legend.labels.fontColor = '#fa1d00';
        // };

        // graphic.options.legend.onClick = function (event) {
        //   return null;
        // };

        // graphic.options.tooltips.callbacks = {
        //   title(tooltipItem, data) {
        //     return data.labels[tooltipItem[0].index];
        //   },
        //   label(tooltipItem, data) {
        //     console.log(tooltipItem, data)
        //     return data.toLocaleString('de-DE');
        //   },
        //   // afterLabel: function (tooltipItem, data) {
        //   //   return "a calcular";
        //   // }
        // };

        graphic.options.tooltips = {
          mode: 'index',
          callbacks: {
            label: function (tooltipItem, data) {
              var label = data.datasets[tooltipItem.datasetIndex].label || '';

              if (label) {
                label += ': ';
              }
              label += tooltipItem.yLabel.toLocaleString('de-DE')
              // label += Math.round(tooltipItem.yLabel * 100) / 100;
              return label;
            }
          }
        };

      }

    }
    );

    let timeseriesTendenciasUrl = '/service/indicators/timeseriesTendencias' + this.getServiceParams();

    this.http.get(timeseriesTendenciasUrl).subscribe(result => {

      this.tendeciaSeries = result;
      for (let graphic of this.tendeciaSeries.timeseries.chartResult) {
        let y = [{
          ticks: {
            beginAtZero: true,
            autoskip: true,
            autoSkipPadding: 20,
            callback: function (value) {
              return value.toLocaleString('de-DE');
            }
          }
        }]

        graphic.options.scales.yAxes = y;

        let x = [{
          ticks: {
            autoskip: false,
            autoSkipPadding: 20
          }
        }]

        graphic.options.scales.xAxes = x;
        graphic.options.legend.onHover = function (event) {
          event.target.style.cursor = 'pointer';
        };

        // graphic.options.legend.onHover = function (event) {
        //   event.target.style.cursor = 'pointer';
        //   graphic.options.legend.labels.fontColor = '#0335fc';
        // };

        // graphic.options.legend.onLeave = function (event) {
        //   event.target.style.cursor = 'default';
        //   graphic.options.legend.labels.fontColor = '#fa1d00';
        // };

        // graphic.options.legend.onClick = function (event) {
        //   return null;
        // };

        // graphic.options.tooltips.callbacks = {
        //   title(tooltipItem, data) {
        //     return data.labels[tooltipItem[0].index];
        //   },
        //   label(tooltipItem, data) {
        //     console.log(tooltipItem, data)
        //     return data.toLocaleString('de-DE');
        //   },
        //   // afterLabel: function (tooltipItem, data) {
        //   //   return "a calcular";
        //   // }
        // };

        graphic.options.tooltips = {
          mode: 'index',
          callbacks: {
            label: function (tooltipItem, data) {
              var label = data.datasets[tooltipItem.datasetIndex].label || '';

              if (label) {
                label += ': ';
              }
              label += tooltipItem.yLabel.toLocaleString('de-DE')
              // label += Math.round(tooltipItem.yLabel * 100) / 100;
              return label;
            }
          }
        };

      }

    }
    );


    let citiesUrl = '/service/indicators/cities' + this.getServiceParams();
    this.exportColumnsCities = [];
    this.http.get(citiesUrl).subscribe(citiesResult => {

      this.chartResultCities = citiesResult;

      let headers = this.chartResultCities.title.split('?');
      let properties = this.chartResultCities.properties.split('?');

      this.chartResultCities.split = [];
      for (let i = 0; i < headers.length; i++) {
        this.chartResultCities.split.push({
          header: headers[i],
          field: properties[i]
        })
      }

      this.exportColumnsCities = this.chartResultCities.split.map(col => ({ title: col.header, dataKey: col.field }));
      if (this.language == 'pt-br') {
        this.chartResultCities.label_ses = this.chartResultCities.label_ses.replace('[source]', 'Secretaria de Estado da Saúde de Goiás')
      }
      else {
        this.chartResultCities.label_ses = this.chartResultCities.label_ses.replace('[source]', ' Goiás State Department of Health')
      }
      let self = this;
      this.chartResultCities.series.forEach(function (item, index) {
        if (item.confirmados > 0 && item.confirmados < 10) {
          self.chartResultCities.series[index].confirmados = "000" + item.confirmados;
        } else if (item.confirmados >= 10 && item.confirmados <= 99) {
          self.chartResultCities.series[index].confirmados = "00" + item.confirmados;
        } else if (item.confirmados >= 100 && item.confirmados <= 999) {
          self.chartResultCities.series[index].confirmados = "0" + item.confirmados;
        }
      });
      this.dataSourceCities = this.chartResultCities.series;
      this.displayedColumnsCities = ["rank", "nome", "confirmados"]

    });

    let neighborhoodsUrl = '/service/indicators/neighborhoods' + this.getServiceParams() + '&timefilter=' + this.selectedBairroTime;
    this.exportColumnsBairros = [];
    this.http.get(neighborhoodsUrl).subscribe(citiesResult => {

      this.neighborhoodsCharts = citiesResult;

      if (this.selectRegion.cd_geocmu == '5300108') {

        if (this.language == 'pt-br') {
          this.neighborhoodsCharts.label += "Distrito Federal"
          this.neighborhoodsCharts.label_sms = this.neighborhoodsCharts.label_sms.replace('de', '');
          this.neighborhoodsCharts.label = this.neighborhoodsCharts.label.replace('de', 'do').replace('Bairros', 'Regiões Administrativas');
        }
        else {
          this.neighborhoodsCharts.label += "Federal Disctrict"
        }
      }
      else {
        this.neighborhoodsCharts.label += this.selectRegion.nome
      }

      this.neighborhoodsCharts.label_sms = this.neighborhoodsCharts.label_sms.replace('[source]', this.neighborhoodsCharts.fonte);
      this.neighborhoodsCharts.label_sms = this.neighborhoodsCharts.label_sms.replace('[date]', this.neighborhoodsCharts.data_ultima_atualizacao);

      let d = new Date(this.neighborhoodsCharts.last_updated);

      this.neighborhoodsCharts.last_updated = this.datePipe.transform(d.setDate(d.getDate() + 1), 'dd/MM/yyyy');

      let headers = this.neighborhoodsCharts.title.split('?');
      let properties = this.neighborhoodsCharts.properties.split('?');

      this.neighborhoodsCharts.split = [];
      for (let i = 0; i < headers.length; i++) {
        this.neighborhoodsCharts.split.push({
          header: headers[i],
          field: properties[i]
        })
      }

      let self = this;
      this.neighborhoodsCharts.series.forEach(function (item, index) {
        if (item.confirmados > 0 && item.confirmados < 10) {
          self.neighborhoodsCharts.series[index].confirmados = "00" + item.confirmados;
        } else if (item.confirmados >= 10 && item.confirmados <= 99) {
          self.neighborhoodsCharts.series[index].confirmados = "0" + item.confirmados;
        }
      });

      this.dataSourceNeighbor = this.neighborhoodsCharts.series;
      this.displayedColumnsNeighbor = ["rank", "nome", "confirmados"]

      if (this.neighborhoodsCharts.showRegion) {
        this.displayedColumnsNeighbor.push("regiao");
      }
      else {
        this.neighborhoodsCharts.split = this.neighborhoodsCharts.split.filter(item => item.field !== "regiao");
      }

      this.exportColumnsBairros = this.neighborhoodsCharts.split.map(col => ({ title: col.header, dataKey: col.field }));

    });

    let deathsUrl = '/service/indicators/deaths' + this.getServiceParams() + '&timefilter=' + this.selectedBairroObitosTime;
    this.exportColumnsBairrosDeaths = [];
    this.http.get(deathsUrl).subscribe(result => {

      this.deathsCharts = result;
      if (this.selectRegion.cd_geocmu == '5300108') {

        if (this.language == 'pt-br') {
          this.deathsCharts.label += "Distrito Federal"
          this.deathsCharts.label_sms = this.neighborhoodsCharts.label_sms.replace('de', '');
          this.deathsCharts.label = this.neighborhoodsCharts.label.replace('de', 'do').replace('Bairros', 'Regiões Administrativas');
        }
        else {
          this.deathsCharts.label += "Federal Disctrict"
        }
      }
      else {
        this.deathsCharts.label += this.selectRegion.nome
      }
      this.deathsCharts.label_sms = this.deathsCharts.label_sms.replace('[source]', this.deathsCharts.fonte);
      this.deathsCharts.label_sms = this.deathsCharts.label_sms.replace('[date]', this.deathsCharts.data_ultima_atualizacao);

      let d = new Date(this.deathsCharts.last_updated);

      this.deathsCharts.last_updated = this.datePipe.transform(d.setDate(d.getDate() + 1), 'dd/MM/yyyy');

      let headers = this.deathsCharts.title.split('?');
      let properties = this.deathsCharts.properties.split('?');

      this.deathsCharts.split = [];
      for (let i = 0; i < headers.length; i++) {
        this.deathsCharts.split.push({
          header: headers[i],
          field: properties[i]
        })
      }

      let self = this;
      this.deathsCharts.series.forEach(function (item, index) {
        if (item.obitos > 0 && item.obitos < 10) {
          self.deathsCharts.series[index].obitos = "000" + item.obitos;
        } else if (item.obitos >= 10 && item.obitos <= 99) {
          self.deathsCharts.series[index].obitos = "00" + item.obitos;
        }
      });

      this.dataSourceDeaths = this.deathsCharts.series;
      this.displayedColumnsDeaths = ["rank", "nome", "obitos"]

      if (this.deathsCharts.showRegion) {
        this.displayedColumnsDeaths.push("regiao");
      }
      else {
        this.deathsCharts.split = this.deathsCharts.split.filter(item => item.field !== "regiao");
      }

      this.exportColumnsBairrosDeaths = this.deathsCharts.split.map(col => ({ title: col.header, dataKey: col.field }));
    });

    let projectionURL = '/service/indicators/projections' + this.getServiceParams();

    this.http.get(projectionURL).subscribe(result => {

      this.dataProjSeries = result;

      // console.log(this.dataProjSeries)
      for (let graphic of this.dataProjSeries.timeseries.chartResult) {


        let y = [{
          ticks: {
            beginAtZero: true,
            autoskip: true,
            autoSkipPadding: 20,
            callback: function (value) {
              return value.toLocaleString('de-DE');
            }
          }
        }]

        graphic.options.scales.yAxes = y;

        let x = [{
          ticks: {
            autoskip: false,
            autoSkipPadding: 20
          }
        }]

        graphic.options.scales.xAxes = x;

        graphic.options.legend.onHover = function (event) {
          event.target.style.cursor = 'pointer';
        };

        // graphic.options.legend.onHover = function (event) {
        //   event.target.style.cursor = 'pointer';
        //   graphic.options.legend.labels.fontColor = '#0335fc';
        // };

        // graphic.options.legend.onLeave = function (event) {
        //   event.target.style.cursor = 'default';
        //   graphic.options.legend.labels.fontColor = '#fa1d00';
        // };

        // graphic.options.legend.onClick = function (event) {
        //   return null;
        // };

        // graphic.options.tooltips.filter = function (tooltipItem, data) {

        //   var label = new Date(data.labels[tooltipItem.index]);
        //   let compr = new Date(graphic.last_model_date)

        //   if (label >= compr) {
        //     return tooltipItem.datasetIndex === 0;
        //   }
        //   else {
        //     return tooltipItem;
        //   }
        // }

      }
    }
    );

    let statesURL = '/service/indicators/states' + this.getServiceParams();
    this.http.get(statesURL).subscribe(statesResult => {
      this.dataStates = statesResult
      this.optionsStates = statesResult['optionsStates'];
    });

    let statisticsURL = '/service/indicators/statistics' + this.getServiceParams();

    this.http.get(statisticsURL).subscribe(res => {
      this.statistics_county = res
      this.statistics_county.result.dias_duplicacao_confirmados = Math.round(this.statistics_county.result.dias_duplicacao_confirmados)

    });

    let brasilURL = '/service/indicators/brasil' + this.getServiceParams();
    this.http.get(brasilURL).subscribe(brasilResult => {
      this.dataBrasil = brasilResult
      this.optionsBrasil = this.dataBrasil.options.options;

      let y = [{
        ticks: {
          beginAtZero: true,
          autoskip: true,
          autoSkipPadding: 25,
          callback: function (value) {
            return value.toLocaleString('de-DE');
          }
        }
      }]

      this.optionsBrasil.scales.yAxes = y;

      let x = [{
        ticks: {
          autoskip: false,
          autoSkipPadding: 20
        }
      }]

      this.optionsBrasil.scales.xAxes = x;


      this.optionsBrasil.legend.onClick = function (event) {
        return null;
      };

      this.optionsBrasil.tooltips = {
        mode: 'index',
        callbacks: {
          label: function (tooltipItem, data) {
            var label = data.datasets[tooltipItem.datasetIndex].label || '';

            if (label) {
              label += ': ';
            }
            label += tooltipItem.yLabel.toLocaleString('de-DE')
            // label += Math.round(tooltipItem.yLabel * 100) / 100;
            return label;
          }
        }
      };

    });
  }

  exportExcel(table) {

    let ob = [];
    let tablename = '';
    if (table == "cities") {
      ob = this.chartResultCities.series;
      tablename = 'ranking_municipios'
    }
    else {
      ob = this.neighborhoodsCharts.series;
      tablename = 'ranking_bairros_' + this.selectRegion.nome
    }

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(ob);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, tablename);
    });
  }

  exportExcelDeaths(table) {

    let ob = [];
    let tablename = '';

    ob = this.deathsCharts.series;
    tablename = 'ranking_bairros_' + this.selectRegion.nome

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(ob);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, tablename);
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    import("file-saver").then(FileSaver => {
      let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    });
  }

  updateRegion(region) {


    if (region == this.defaultRegion) {
      this.valueRegion = '';
      this.currentData = {
        text: ''
      };

      this.user = {};
      this.restrictedArea = false;

      let l = this.layersNames.find(element => element.id === 'urban_traffic');
      this.changeVisibility(l, { checked: false });
      let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
      this.changeVisibility(p, { checked: true });

      let bairro = this.layersNames.find(element => element.id === 'casos_bairro');
      this.changeVisibility(bairro, { checked: false });
      bairro.types[0].timeSelected = "cd_geocmu = '52'"

      let bairroObitos = this.layersNames.find(element => element.id === 'obitos_bairro');
      this.changeVisibility(bairroObitos, { checked: false });
      bairroObitos.types[0].timeSelected = "cd_geocmu = '52'"

      let r_bairro = this.layersNames.find(element => element.id === 'r_por_bairro');
      this.changeVisibility(r_bairro, { checked: false });
      r_bairro.types[0].timeSelected = "cd_geocmu = '52'"

      this.isFilteredByCity = false;
    }
    else {
      this.isFilteredByCity = true;
    }

    this.currentData = region.nome;
    this.valueRegion = region.nome;

    this.selectRegion = region;
    this.selectRegion.nome = this.captalizeCity(this.selectRegion.nome);

    this.selectedBairroTime = "(select max(data_ultima_atualizacao) from v_casos_bairros where cd_geocmu = '" + this.selectRegion.cd_geocmu + "')"
    this.selectedBairroObitosTime = "(select max(data_ultima_atualizacao) from v_obitos_bairros where cd_geocmu = '" + this.selectRegion.cd_geocmu + "')"

    if (this.selectRegion.cd_geocmu != '52') {
      this.getDates('/service/indicators/datesNeighborhoods');
    } else {
      this.getDates();
    }

    // if (this.isFilteredByCity) {
    //   this.msFilterRegion = ' cd_geocmu = \'' + this.selectRegion.cd_geocmu + '\'';
    // }

    this.updateCharts();
    this.updateExtent();
    this.updateSourceAllLayer();
    this.updateSource();
    this.updateSummary();
    this.googleAnalyticsService.eventEmitter("updateRegion", "search_box", this.valueRegion);
  }


  zoomToCityOnTypesLayer(layer) {

    if (layer.value == "casos_por_bairro_covid") {
      if (layer.timeSelected == "cd_geocmu = '52'") {
        this.selectedBairroTime = "(select max(data_ultima_atualizacao) from v_casos_bairros)"
      }
      else {

        let tmp

        if (layer['times']) {
          tmp = layer['times'].find(
            element => element.value === layer.timeSelected
          );
        }

        this.http.get(SEARCH_URL, { params: PARAMS.set('key', tmp.Viewvalue) }).subscribe(result => {

          let ob = result[0];
          this.updateRegion(ob);

          // this.selectedBairroTime = "(select max(data_ultima_atualizacao) from v_casos_bairros where cd_geocmu = '" + this.selectRegion.cd_geocmu +"')"


          this.handleInteraction();
          // let l = this.layersNames.find(element => element.id === 'urban_traffic');
          // this.changeVisibility(l, { checked: true });
          let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
          this.changeVisibility(p, { checked: false });
          this.infodata = null



        });
      }
    }

    if (layer.value == "obitos_por_bairro_covid") {
      if (layer.timeSelected == "cd_geocmu = '52'") {
        this.selectedBairroObitosTime = "(select max(data_ultima_atualizacao) from v_obitos_bairros)"
      }
      else {

        let tmp

        if (layer['times']) {
          tmp = layer['times'].find(
            element => element.value === layer.timeSelected
          );
        }

        this.http.get(SEARCH_URL, { params: PARAMS.set('key', tmp.Viewvalue) }).subscribe(result => {

          let ob = result[0];
          this.updateRegion(ob);

          this.handleInteraction();
          let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
          this.changeVisibility(p, { checked: false });
          this.infodata = null

        });
      }
    }

    if (layer.value == "r_por_bairro_covid") {
      if (layer.timeSelected == "cd_geocmu = '52'") {
        this.selectedBairroObitosTime = "(select max(data_atualizacao) from r_bairros)"
      }
      else {

        let tmp

        if (layer['times']) {
          tmp = layer['times'].find(
            element => element.value === layer.timeSelected
          );
        }

        this.http.get(SEARCH_URL, { params: PARAMS.set('key', tmp.Viewvalue) }).subscribe(result => {

          let ob = result[0];
          this.updateRegion(ob);

          this.handleInteraction();
          let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
          this.changeVisibility(p, { checked: false });
          this.infodata = null

        });
      }
    }
  }

  private captalizeCity(word: string) {
    let finalword = "";
    let tmp = word.toLowerCase().split(" ");
    for (let i = 0; i < tmp.length; i++) {
      if (tmp[i] == 'da' || tmp[i] == 'de' || tmp[i] == 'do') {
        finalword += tmp[i] + " "
      } else {
        finalword += tmp[i].charAt(0).toUpperCase() + tmp[i].slice(1) + " "
      }
    }

    return finalword
  }

  private getResolutions(projection) {
    let projExtent = projection.getExtent();
    let startResolution = OlExtent.getWidth(projExtent) / 256;
    let resolutions = new Array(22);
    for (let i = 0, ii = resolutions.length; i < ii; ++i) {
      resolutions[i] = startResolution / Math.pow(2, i);
    }
    return resolutions;
  }

  private createMap() {
    this.createBaseLayers();
    this.createLayers();


    this.map = new OlMap({
      target: 'map',
      controls: [],
      layers: this.layers,
      view: new OlView({
        center: OlProj.fromLonLat([-49, -15.9]),
        projection: this.projection,
        zoom: this.currentZoom,
        maxZoom: 18,
        minZoom: 2
      }),
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      interactions: defaultInteractions({ altShiftDragRotate: false, pinchRotate: false })
    });

    let style = new Style({
      image: new Circle({
        radius: 7,
        fill: new Fill({ color: '#b8714e', width: 1 }),
        stroke: new Stroke({ color: '#7b2900', width: 2 })
      })
    });

    this.infoOverlay = new Overlay({
      element: document.getElementById('map-info'),
      offset: [15, 15],
      stopEvent: false
    });

    this.keyForPointer = this.map.on(
      'pointermove',
      this.callbackPointerMoveMap.bind(this)
    );

    this.keyForClick = this.map.on(
      'singleclick',
      this.callbackClickMap.bind(this)
    );

    this.map.addOverlay(this.infoOverlay);
    this.createCropFilter()


  }

  private callbackPointerMoveMap(evt) {

    let utfgridlayerVisible = this.utfgridlayer.getVisible();
    if (!utfgridlayerVisible || evt.dragging) {
      return;
    }

    let utfgridlayerBairroVisible = this.utfgridlayerBairro.getVisible();
    if (!utfgridlayerBairroVisible || evt.dragging) {
      return;
    }

    let utfgridlayerBairroObitosVisible = this.utfgridlayerBairroObitos.getVisible();
    if (!utfgridlayerBairroObitosVisible || evt.dragging) {
      return;
    }

    let utfgridlayerTendenciasVisible = this.utfgridlayerTendencias.getVisible();
    if (!utfgridlayerTendenciasVisible || evt.dragging) {
      return;
    }

    let utfgridlayerTemperaturesVisible = this.utfgridlayerTemperatures.getVisible();
    if (!utfgridlayerTemperaturesVisible || evt.dragging) {
      return;
    }


    let coordinate = this.map.getEventCoordinate(evt.originalEvent);
    let viewResolution = this.map.getView().getResolution();



    var feature = this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      return feature;
    });

    this.infoOverlay.setPosition(coordinate);

    if (feature) {

      var properties = feature.getProperties();

      if (this.avoidMarkers.includes(properties['source'])) {

        this.clickable = true
        window.document.body.style.cursor = 'pointer';

        if (properties['nome'] != undefined) {
          this.clickableTitle = properties['nome']
        }

        if (properties['source'] == "go_hospitais_datasus") {
          if (properties['horario'] != undefined) {
            this.infomarker.horario = properties['horario']
          }
          if (properties['leitos_cli'] != undefined) {
            this.infomarker.leitos_clinica = parseInt(properties['leitos_cli'])
          }
          if (properties['leitos_uti'] != undefined) {
            this.infomarker.leitos_uti = parseInt(properties['leitos_uti'])
          }
        }
        else if (properties['source'] == "vacinacao_gripe") {
          if (properties['horario'] != undefined) {
            this.infomarker.horario = properties['horario']
          }
        }

      }
    } else {
      this.clickableTitle = this.minireportText.label_clickable
      this.clickable = false
      window.document.body.style.cursor = 'auto';
      this.infomarker = {};

      let info = this.layersNames.find(element => element.id === 'casos_covid_confirmados');

      if (info.visible) {

        if (this.utfgridsource) {
          this.utfgridsource.forDataAtCoordinateAndResolution(coordinate, viewResolution, function (data) {
            if (data) {
              window.document.body.style.cursor = 'pointer';

              this.infodata = data;

              if (this.infodata.confirmados == "") {
                this.infodata.confirmados = 0;
              }

              this.infodata.pop_2019 = this.infodata.pop_2019.toLocaleString('de-DE')
              this.infodata.area_mun = Math.round(this.infodata.area_mun * 1000) / 1000

            } else {
              window.document.body.style.cursor = 'auto';
              this.infodata = null;
            }

          }.bind(this)
          );
        }
      }
      else {
        this.infodata = null;
      }

      let bairro = this.layersNames.find(element => element.id === 'casos_bairro');
      let r_bairro = this.layersNames.find(element => element.id === 'r_por_bairro');
      if (bairro.visible || r_bairro.visible) {

        let zoom = this.map.getView().getZoom();

        if (this.utfgridBairro) {
          this.utfgridBairro.forDataAtCoordinateAndResolution(coordinate, viewResolution, function (data) {
            if (data && data.numpoints > 0) {
              // window.document.body.style.cursor = 'pointer';

              this.infobairro = data;

              if (this.infobairro.nome == "") {
                this.infobairro.nome = this.minireportText.undisclosed_message;
              }

            } else {
              window.document.body.style.cursor = 'auto';
              this.infobairro = null;
            }

          }.bind(this)
          );
        }
      } else {
        this.infobairro = null;
      }

      let bairroObitos = this.layersNames.find(element => element.id === 'obitos_bairro');
      if (bairroObitos.visible) {

        let zoom = this.map.getView().getZoom();

        if (this.utfgridBairroObitos) {
          this.utfgridBairroObitos.forDataAtCoordinateAndResolution(coordinate, viewResolution, function (data) {
            if (data && data.numpoints > 0) {
              // window.document.body.style.cursor = 'pointer';

              this.infobairroObitos = data;

              if (this.infobairroObitos.nome == "") {
                this.infobairroObitos.nome = this.minireportText.undisclosed_message;
              }

            } else {
              window.document.body.style.cursor = 'auto';
              this.infobairroObitos = null;
            }

          }.bind(this)
          );
        }
      } else {
        this.infobairroObitos = null;
      }

      let projecao = this.layersNames.find(element => element.id === 'projecoes_luisa');
      if (projecao.visible) {

        let zoom = this.map.getView().getZoom();

        if (this.utfgridProjecao) {
          this.utfgridProjecao.forDataAtCoordinateAndResolution(coordinate, viewResolution, function (data) {
            if (data) {
              // window.document.body.style.cursor = 'pointer';
              this.infoprojecao = data;

              if (this.infoprojecao.nome == "") {
                this.infoprojecao.nome = this.minireportText.undisclosed_message;
              }

            } else {
              window.document.body.style.cursor = 'auto';
              this.infoprojecao = null;
            }

          }.bind(this)
          );
        }
      } else {
        this.infoprojecao = null;
      }

      let temperatures = this.layersNames.find(element => element.id === 'clima_temperatura');
      if (temperatures.visible) {

        let zoom = this.map.getView().getZoom();

        if (this.utfgridTemperatures) {
          this.utfgridTemperatures.forDataAtCoordinateAndResolution(coordinate, viewResolution, function (data) {
            if (data) {
              window.document.body.style.cursor = 'pointer';

              this.infoTemperatures = data;

              this.infoTemperatures.ur = parseFloat(this.infoTemperatures.ur).toFixed(1).replace(".", ",")
              this.infoTemperatures.temperatura = parseFloat(this.infoTemperatures.temperatura).toFixed(1).replace(".", ",")


              if (this.infoTemperatures.nome == "") {
                this.infoTemperatures.nome = this.minireportText.undisclosed_message;
              }

            } else {
              window.document.body.style.cursor = 'auto';
              this.infoTemperatures = null;
            }

          }.bind(this)
          );
        }
      } else {
        this.infoTemperatures = null;
      }

    }

  }

  private callbackClickMap(evt) {

    let zoom = this.map.getView().getZoom();

    let coordinate = this.map.getEventCoordinate(evt.originalEvent);
    let viewResolution = this.map.getView().getResolution();

    var feature = this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      return feature;
    });

    let layerinfo = this.layersNames.find(element => element.id === 'casos_covid_confirmados');

    if (feature) {
      var properties = feature.getProperties();
      if (properties.lon != undefined && properties.lat != undefined) {
        var redirectUrl = "https://www.google.com/maps/search/?api=1&query=" + properties.lat + "," + properties.lon
        window.open(redirectUrl, "_blank");
      }
    } else if (this.utfgridsource) {

      if (layerinfo.visible) {

        this.utfgridsource.forDataAtCoordinateAndResolution(coordinate, viewResolution, function (data) {
          if (data) {
            // console.log("data", data)
            if (layerinfo.selectedType == 'covid19_municipios_casos') {

              let achou = false
              for (let layer of this.layersTypes) {
                if (layer.value == "casos_por_bairro_covid") {
                  for (let time of layer.times) {
                    let str = time.value + ""
                    if (str.includes(data.cd_geocmu)) {
                      layer.timeSelected = time.value
                      achou = true
                    }
                  }
                }
              }

              if (achou) {
                let bairro = this.layersNames.find(element => element.id === 'casos_bairro');
                let tipo = bairro.types.find(element => element.value === 'casos_por_bairro_covid')

                this.changeVisibility(bairro, { checked: true });
                this.zoomToCityOnTypesLayer(tipo)

              } else {

                this.http.get(SEARCH_URL, { params: PARAMS.set('key', data.nome) }).subscribe(result => {

                  let ob = result[0];
                  this.updateRegion(ob);
                  let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
                  this.changeVisibility(p, { checked: false });

                  let urban_traffic = this.layersNames.find(element => element.id === 'urban_traffic');
                  this.changeVisibility(urban_traffic, { checked: true });

                  this.handleInteraction();
                  this.infodata = null
                });
              }
            }

          }
        }.bind(this)
        );
      }
    }
  }

  private createBaseLayers() {
    this.mapbox = {
      visible: false,
      layer: new OlTileLayer({
        source: new OlXYZ({
          wrapX: false,
          url:
            'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
        }),
        visible: false
      })
    };

    this.satelite = {
      visible: false,
      layer: new OlTileLayer({
        preload: Infinity,
        source: new BingMaps({
          key:
            'VmCqTus7G3OxlDECYJ7O~G3Wj1uu3KG6y-zycuPHKrg~AhbMxjZ7yyYZ78AjwOVIV-5dcP5ou20yZSEVeXxqR2fTED91m_g4zpCobegW4NPY',
          imagerySet: 'Aerial'
        }),
        visible: false
      })
    };

    this.estradas = {
      visible: false,
      layer: new OlTileLayer({
        preload: Infinity,
        source: new BingMaps({
          key:
            'VmCqTus7G3OxlDECYJ7O~G3Wj1uu3KG6y-zycuPHKrg~AhbMxjZ7yyYZ78AjwOVIV-5dcP5ou20yZSEVeXxqR2fTED91m_g4zpCobegW4NPY',
          imagerySet: 'Road'
        }),
        visible: false
      })
    };

    this.relevo = {
      visible: false,
      layer: new OlTileLayer({
        source: new OlXYZ({
          url:
            'https://server.arcgisonline.com/ArcGIS/rest/services/' +
            'World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'
        }),
        visible: false
      })
    };

    this.googlemaps = {
      visible: true,
      layer: new OlTileLayer({
        source: new OlXYZ({
          url:
            'https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          attributions: [
            new Attribution({ html: '© Google' }),
            new Attribution({ html: '<a href="https://developers.google.com/maps/terms">Terms of Use.</a>' })
          ]

        }),
        visible: true
      })
    };

    this.trafficgoogle = {
      visible: false,
      layer: new OlTileLayer({
        source: new OlXYZ({
          url:
            'https://mt1.google.com/vt?lyrs=h@159000000,traffic|seconds_into_week:-1&style=3&x={x}&y={y}&z={z}',
          attributions: [
            new Attribution({ html: '© Google' }),
            new Attribution({ html: '<a href="https://developers.google.com/maps/terms">Terms of Use.</a>' })
          ]

        }),
        visible: false
      })
    };

    this.landsat = {
      visible: false,
      layer: new OlTileLayer({
        source: new TileWMS({
          url: 'http://mapbiomas-staging.terras.agr.br/wms',
          projection: 'EPSG:3857',
          params: {
            LAYERS: 'rgb',
            SERVICE: 'WMS',
            TILED: true,
            VERSION: '1.1.1',
            TRANSPARENT: 'true',
            MAP: 'wms/v/staging/classification/rgb.map',
            YEAR: 2017
          },
          serverType: 'mapserver',
          tileGrid: this.tileGrid
        }),
        visible: false
      })
    };

    for (let baseName of this.basemapsNames) {
      this.layers.push(this[baseName.value].layer);
    }
  }

  private createMarkerLayer(layer) {
    var markerStyle = {
      'Point': new Style({
        image: new Icon({
          src: layer.iconUrl
        })
      })
    };

    return new VectorLayer({
      source: new VectorSource({
        url: layer.url,
        format: new GeoJSON()
      }),
      style: function (feature) {
        return markerStyle[feature.getGeometry().getType()]
      },
      visible: layer.visible
    });

  }

  private createLayers() {
    let olLayers: OlTileLayer[] = new Array();

    // layers
    for (let layer of this.layersTypes) {

      if (layer.source == 'geojson') {
        this.LayersTMS[layer.value] = this.createMarkerLayer(layer);
      } else {
        this.LayersTMS[layer.value] = this.createTMSLayer(layer);
      }

      this.layers.push(this.LayersTMS[layer.value]);

    }

    // limits
    for (let limits of this.limitsNames) {
      this.limitsTMS[limits.value] = this.createTMSLayer(limits);
      this.layers.push(this.limitsTMS[limits.value]);
    }

    this.regionsLimits = this.createVectorLayer('regions', '#666633', 3);
    this.layers.push(this.regionsLimits);

    this.utfgridsource = new UTFGrid({
      tileJSON: this.getTileJSON()
    });

    this.utfgridlayer = new OlTileLayer({
      source: this.utfgridsource
    });

    this.utfgridBairro = new UTFGrid({
      tileJSON: this.getTileJSONBairros()
    });

    this.utfgridBairroObitos = new UTFGrid({
      tileJSON: this.getTileJSONBairrosObitos()
    });

    this.utfgridlayerBairro = new OlTileLayer({
      source: this.utfgridBairro
    });

    this.utfgridlayerBairroObitos = new OlTileLayer({
      source: this.utfgridBairroObitos
    });

    this.utfgridProjecao = new UTFGrid({
      tileJSON: this.getTileJSONProjecao()
    });

    this.utfgridlayerProjecao = new OlTileLayer({
      source: this.utfgridProjecao
    });

    this.utfgridTendencias = new UTFGrid({
      tileJSON: this.getTileJSONTendencias()
    });

    this.utfgridlayerTendencias = new OlTileLayer({
      source: this.utfgridTendencias
    });

    this.utfgridTemperatures = new UTFGrid({
      tileJSON: this.getTileJSONTemperatures()
    });

    this.utfgridlayerTemperatures = new OlTileLayer({
      source: this.utfgridTemperatures
    });

    this.layers.push(this.utfgridlayer);
    this.layers.push(this.utfgridlayerBairro)
    this.layers.push(this.utfgridlayerBairroObitos)
    this.layers.push(this.utfgridlayerProjecao)
    this.layers.push(this.utfgridlayerTemperatures)

    this.layers = this.layers.concat(olLayers.reverse());
  }

  private getTileJSON() {

    let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');

    let layer = p.types.find(element => element.value === 'covid19_municipios_casos')


    if (this.selectedConfirmedDate == '') {
      layer.layerfilter = "data = (select max(data) from casos)"
    } else {
      layer.layerfilter = "date_trunc('day',data) = '" + this.selectedConfirmedDate + "'"
    }

    let filter = layer.layerfilter;

    return {
      version: '2.2.0',
      grids: [
        this.returnUTFGRID('covid19_municipios_casos', filter, '{x}+{y}+{z}')
      ]
    };

  }

  private getTileJSONBairros() {

    let filter = "cd_geocmu='" + this.selectRegion.cd_geocmu + "' AND data_ultima_atualizacao = " + this.selectedBairroTime;
    return {
      version: '2.2.0',
      grids: [
        this.returnUTFGRID('casos_por_bairro_covid', filter, '{x}+{y}+{z}')
      ]
    };
  }

  private getTileJSONBairrosObitos() {

    let filter = "cd_geocmu='" + this.selectRegion.cd_geocmu + "' AND data_ultima_atualizacao = " + this.selectedBairroObitosTime;
    return {
      version: '2.2.0',
      grids: [
        this.returnUTFGRID('obitos_por_bairro_covid', filter, '{x}+{y}+{z}')
      ]
    };
  }

  private getTileJSONProjecao() {

    let p = this.layersNames.find(element => element.id === 'projecoes_luisa');
    let layer = p.types.find(element => element.value === p.selectedType);

    return {
      version: '2.2.0',
      grids: [
        this.returnUTFGRID(p.selectedType, layer.layerfilter, '{x}+{y}+{z}')
      ]
    };

  }

  private getTileJSONTendencias() {

    let p = this.layersNames.find(element => element.id === 'tendencia');
    let layer = p.types.find(element => element.value === p.selectedType);

    return {
      version: '2.2.0',
      grids: [
        this.returnUTFGRID(p.selectedType, layer.layerfilter, '{x}+{y}+{z}')
      ]
    };

  }

  private getTileJSONTemperatures() {

    let p = this.layersNames.find(element => element.id === 'clima_temperatura');
    let layer = p.types.find(element => element.value === p.selectedType);

    return {
      version: '2.2.0',
      grids: [
        this.returnUTFGRID(p.selectedType, layer.layerfilter, '{x}+{y}+{z}')
      ]
    };

  }

  private returnUTFGRID(layername, filter, tile) {
    return '/ows?layers=' + layername + '&MSFILTER=' + filter + '&mode=tile&tile=' + tile + '&tilemode=gmap&map.imagetype=utfgrid'
  }

  private createTMSLayer(layer) {
    return new OlTileLayer({
      source: new OlXYZ({
        urls: this.parseUrls(layer)
      }),
      tileGrid: this.tileGrid,
      visible: layer.visible,
      opacity: layer.opacity
    });
  }

  private createVectorLayer(layerName, strokeColor, width) {
    return new VectorLayer({
      name: layerName,
      source: new VectorSource(),
      style: [
        new Style({
          stroke: new Stroke({
            color: '#dedede',
            width: width + 1
          })
        }),
        new Style({
          stroke: new Stroke({
            color: strokeColor,
            width
          })
        })
      ]
    });
  }

  private parseUrls(layer) {
    let result = [];

    if (layer.source == 'ows') {

      let filters = [];

      if (this.selectRegion.cd_geocmu != '52' && this.showSlider) {
        layer.timeSelected = "cd_geocmu = '" + this.selectRegion.cd_geocmu + "' AND " + layer.layerfilter;
      }

      // if (layer.timeHandler == 'msfilter' && layer.times) {
      //   filters.push(layer.timeSelected);
      // }

      if (layer.layerfilter) {
        filters.push(layer.layerfilter);
      } else {
        if (layer.timeHandler == 'msfilter' && layer.times) {
          filters.push(layer.timeSelected);
        }
      }

      if (this.regionFilterDefault != "") { filters.push(this.regionFilterDefault); }
      if (layer.regionFilter && this.msFilterRegion) {
        filters.push(this.msFilterRegion);
      }

      let msfilter = '';
      if (filters.length > 0) { msfilter += '&MSFILTER=' + filters.join(' AND '); }

      let layername = layer.value;
      if (layer.timeHandler == 'layername') { layername = layer.timeSelected; }

      for (let url of this.urls) {
        result.push(url + '?layers=' + layername + msfilter + '&mode=tile&tile={x}+{y}+{z}' + '&tilemode=gmap' + '&map.imagetype=png');
      }
    }
    else if (layer.source == 'external') {
      result.push(layer.url)
    }


    return result;
  }

  private updateSourceAllLayer() {
    for (let layer of this.layersTypes) {
      this.updateSourceLayer(layer);
    }
  }

  private updateSourceLayer(layer) {

    this.handleInteraction();

    let source_layers = this.LayersTMS[layer.value].getSource();

    if (layer.source != 'geojson') {
      source_layers.setUrls(this.parseUrls(layer));
      source_layers.refresh();
    }

  }

  baseLayerChecked(base, e) {
    for (let basemap of this.basemapsNames) {
      if (base.value == basemap.value && e.checked) {
        this[base.value].layer.setVisible(true);
        basemap.visible = true;
      } else if (basemap.value != base.value) {
        this[basemap.value].layer.setVisible(false);
        basemap.visible = false;
      } else {
        this[this.descriptor.basemaps[0].defaultBaseMap].layer.setVisible(true);
        if (basemap.value != this.descriptor.basemaps[0].defaultBaseMap) {
          this[basemap.value].layer.setVisible(false);
          this[basemap.value].visible = false;
        }
      }
    }

  }

  groupLayerschecked(layers, e) {
    if (e.checked) {
      this.LayersTMS[layers].setVisible(e.checked);
    } else {
      this.LayersTMS[layers].setVisible(e.checked);
    }
  }

  limitsLayersChecked(layers, e) {
    // limits
    for (let limits of this.limitsNames) {
      if (layers.value == limits.value && e.checked) {
        this.limitsTMS[limits.value].setVisible(true);
        limits.visible = true;
      } else {
        this.limitsTMS[limits.value].setVisible(false);
        limits.visible = false;
      }
    }
  }

  private handleInteraction() {

    let covid = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
    let bairros = this.layersNames.find(element => element.id === 'casos_bairro');
    let bairrosObitos = this.layersNames.find(element => element.id === 'obitos_bairro');
    let projecao = this.layersNames.find(element => element.id === 'projecoes_luisa');
    let clima_temperatura = this.layersNames.find(element => element.id === 'clima_temperatura');
    let r_bairros = this.layersNames.find(element => element.id === 'r_por_bairro');

    if (covid.visible || bairros.visible || bairrosObitos.visible || projecao.visible || clima_temperatura.visible) {
      if (covid.selectedType == 'covid19_municipios_casos') {

        if (this.utfgridsource) {
          let tileJSON = this.getTileJSON();

          this.utfgridsource.tileUrlFunction_ = _ol_TileUrlFunction_.createFromTemplates(tileJSON.grids, this.utfgridsource.tileGrid);
          this.utfgridsource.tileJSON = tileJSON;
          this.utfgridsource.refresh();

          this.utfgridlayer.setVisible(true);
        }
      }

      if (bairros.selectedType == 'casos_por_bairro_covid' || r_bairros.selectedType == 'r_por_bairro_covid') {
        if (this.utfgridBairro) {
          let tileJSONBairro = this.getTileJSONBairros();

          this.utfgridBairro.tileUrlFunction_ = _ol_TileUrlFunction_.createFromTemplates(tileJSONBairro.grids, this.utfgridBairro.tileGrid);
          this.utfgridBairro.tileJSON = tileJSONBairro;
          this.utfgridBairro.refresh();

          this.utfgridlayerBairro.setVisible(true);
        }
      }

      if (bairrosObitos.selectedType == 'obitos_por_bairro_covid') {
        if (this.utfgridBairroObitos) {
          let tileJSONBairroObitos = this.getTileJSONBairrosObitos();

          this.utfgridBairroObitos.tileUrlFunction_ = _ol_TileUrlFunction_.createFromTemplates(tileJSONBairroObitos.grids, this.utfgridBairro.tileGrid);
          this.utfgridBairroObitos.tileJSON = tileJSONBairroObitos;
          this.utfgridBairroObitos.refresh();

          this.utfgridlayerBairroObitos.setVisible(true);
        }
      }

      if (this.utfgridProjecao) {
        let tileJSONProjecao = this.getTileJSONProjecao();

        this.utfgridProjecao.tileUrlFunction_ = _ol_TileUrlFunction_.createFromTemplates(tileJSONProjecao.grids, this.utfgridProjecao.tileGrid);
        this.utfgridProjecao.tileJSON = tileJSONProjecao;
        this.utfgridProjecao.refresh();

        this.utfgridlayerProjecao.setVisible(true);
      }

      // if (this.utfgridTendencias) {
      //   let tileJSONTendencias = this.getTileJSONTendencias();
      //   this.utfgridTendencias.tileUrlFunction_ = _ol_TileUrlFunction_.createFromTemplates(tileJSONTendencias.grids, this.utfgridTendencias.tileGrid);
      //   this.utfgridTendencias.tileJSON = tileJSONTendencias;
      //   this.utfgridTendencias.refresh();
      //
      //   this.utfgridlayerTendencias.setVisible(true);
      // }

      if (this.utfgridTemperatures) {
        let tileJSONTemperatures = this.getTileJSONTemperatures();
        this.utfgridTemperatures.tileUrlFunction_ = _ol_TileUrlFunction_.createFromTemplates(tileJSONTemperatures.grids, this.utfgridTemperatures.tileGrid);
        this.utfgridTemperatures.tileJSON = tileJSONTemperatures;
        this.utfgridTemperatures.refresh();

        this.utfgridlayerTemperatures.setVisible(true);
      }

    } else if (this.utfgridsource && this.utfgridBairro && this.utfgridProjecao && this.utfgridTendencias && this.utfgridTemperatures) {
      this.utfgridlayer.setVisible(false);
      this.utfgridlayerBairro.setVisible(false);
      this.utfgridlayerProjecao.setVisible(false);
      this.utfgridlayerTendencias.setVisible(false);
      this.utfgridlayerTemperatures.setVisible(false);
    }


    this.googleAnalyticsService.eventEmitter("handleInteraction", "geojson", 'casos-covid');

  }

  changeVisibility(layer, e) {

    for (let layerType of layer.types) {
      this.LayersTMS[layerType.value].setVisible(false);
    }

    if (e != undefined) {
      layer.visible = e.checked;
    }

    if (layer.id == "casos_covid_confirmados" || layer.id == "casos_bairro") {
      if (layer.visible) {
        this.handleInteraction();
      }
    }

    this.LayersTMS[layer.selectedType].setVisible(layer.visible);
    // this.updateSummary();
    this.googleAnalyticsService.eventEmitter("changeVisibility", "camadaDado", layer.label);

  }

  private updateDescriptor() {

    this.descriptor.type = this.descriptorText.type_of_information_label[this.language];

    for (let group of this.descriptor.groups) {

      group.label = this.descriptorText[group.id].label[this.language];

      for (let layer of group.layers) {

        layer.label = this.descriptorText[group.id].layers[layer.id].label[this.language];

        for (let layerType of layer.types) {

          if (this.descriptorText[group.id].layers[layer.id].hasOwnProperty('types')) {

            if (this.descriptorText[group.id].layers[layer.id].types[layerType.value].hasOwnProperty('view_value')) {

              layerType.Viewvalue = this.descriptorText[group.id].layers[layer.id].types[layerType.value].view_value[this.language];
            }
            if (this.descriptorText[group.id].layers[layer.id].types[layerType.value].hasOwnProperty('timelabel')) {
              layerType.timeLabel = this.descriptorText[group.id].layers[layer.id].types[layerType.value].timelabel[this.language];
            }

            if (layerType.times) {
              for (let time of layerType.times) {

                if (this.descriptorText[group.id].layers[layer.id].types[layerType.value].hasOwnProperty('times[time.value]')) {
                  time.Viewvalue = this.descriptorText[group.id].layers[layer.id].types[layerType.value].times[time.value][this.language]
                }
              }
            }
          }
        }
      }
    }

    for (let basemap of this.descriptor.basemaps) {
      for (let types of basemap.types) {
        types.viewValue = this.descriptorText.basemaps.types[types.value][this.language];
      }
    }

    for (let limits of this.descriptor.limits) {
      for (let types of limits.types) {

        types.Viewvalue = this.descriptorText.limits.types[types.value][this.language];
      }
    }
  }

  public onFileComplete(data: any) {

    let map = this.map;

    this.layerFromUpload.checked = false;

    if (this.layerFromUpload.layer != null) {
      map.removeLayer(this.layerFromUpload.layer);
    }
    if (!data.hasOwnProperty('features')) {
      return;
    }

    if (data.features.length > 1) {
      this.layerFromUpload.loading = false;

      this.layerFromUpload.visible = false;
      this.layerFromUpload.label = data.name;
      this.layerFromUpload.layer = data;

    } else {
      this.layerFromUpload.loading = false;

      if (data.features[0].hasOwnProperty('properties')) {

        let auxlabel = Object.keys(data.features[0].properties)[0];
        this.layerFromUpload.visible = false;
        this.layerFromUpload.label = data.features[0].properties[auxlabel];
        this.layerFromUpload.layer = data;

      } else {

        this.layerFromUpload.visible = false;
        this.layerFromUpload.label = data.name;
        this.layerFromUpload.layer = data;
      }
    }

    this.layerFromUpload.visible = true;

    let vectorSource = new VectorSource({
      features: (new GeoJSON()).readFeatures(data, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    });


    this.layerFromUpload.layer = new VectorLayer({
      source: vectorSource,
      style: [
        new Style({
          stroke: new Stroke({
            color: this.layerFromUpload.strokeColor,
            width: 4
          })
        }),
        new Style({
          stroke: new Stroke({
            color: this.layerFromUpload.strokeColor,
            width: 4,
            lineCap: 'round',
            zIndex: 1
          })
        })
      ]
    });

  }

  onChangeCheckUpload(event) {
    let map = this.map;
    this.layerFromUpload.checked = !this.layerFromUpload.checked;

    if (this.layerFromUpload.checked) {

      map.addLayer(this.layerFromUpload.layer);
      let extent = this.layerFromUpload.layer.getSource().getExtent();
      map.getView().fit(extent, { duration: 1800 });

      // let prodes = this.layersNames.find(element => element.id === 'desmatamento_prodes');
      // prodes.selectedType = 'bi_ce_prodes_desmatamento_100_fip';
      // this.changeVisibility(prodes, undefined);
      // this.infodataMunicipio = null;

    } else {
      map.removeLayer(this.layerFromUpload.layer);
    }

  }

  private getMetadata(metadata) {
    let _metadata = [];
    let lang = this.language;

    metadata.forEach(function (data) {
      _metadata.push({ title: data.title[lang], description: data.description[lang] });
    });

    return _metadata;
  }

  openInfo() {
    let dialogRef = this.dialog.open(NoteComponent, {
      width: '80%',
      data: { note: this.controls.note }
    });
  }

  openInfoProjections() {
    let dialogRef = this.dialog.open(ProjectionsComponent, {
      id: 'covidBioBr',
      width: '70%',
      data: {}
    });
  }

  openInfoTemperatures() {
    let dialogRef = this.dialog.open(DocsComponent, {
      id: 'infoNoteTemperature',
      width: '70%',
      data: { src: this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/documentos/NotaTecnica_IQA_COVID-19_UFG.pdf') }
    });
  }
  openInfoR() {
    let dialogRef = this.dialog.open(DocsComponent, {
      id: 'infoNoteR',
      width: '70%',
      data: { src: this.domSanitizer.bypassSecurityTrustResourceUrl('../../../assets/documentos/R_bairros_modelos.pdf') }
    });
  }

  downloadCSV(layer) {

    let selected = {
      layer,
      selectedRegion: this.selectRegion,
      year: this.selectedTimeFromLayerType(layer.selectedType)
    };

    // this.http.get('/service/download/csv', { params: PARAMS.set("data", selected) }).subscribe(result => {
    //
    // });
  }

  downloadSHP(layer) {
    let selected = {
      layer,
      selectedRegion: this.selectRegion,
      year: this.selectedTimeFromLayerType(layer.selectedType)
    };
    //
    // this.http.get('/service/download/shp', { params: PARAMS.set("data", selected) }).subscribe(result => {
    //
    // });
  }

  buttonDownload(tipo, layer, e) {
    if (tipo == 'csv') {
      this.downloadCSV(layer);
    } else {
      this.downloadSHP(layer);
    }
  }

  async printViewMap() {

    let language = this.language;
    let dd = {
      pageSize: 'A4',

      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'landscape',

      // [left, top, right, bottom]
      pageMargins: [40, 70, 40, 20],

      header: {
        margin: [24, 10, 24, 30],
        columns: [
          {
            image: logos.logoCovid,
            width: 130
          },
          // {
          //   // [left, top, right, bottom]
          //   margin:[ 0, 20, 0, 0 ],
          //   text: logos.print[language].toUpperCase(),
          //   alignment: 'center',
          //   style: 'titleReport',
          // },
          {
            image: logos.logoUFG,
            width: 130
          },
        ]
      },
      footer: function (currentPage, pageCount) {
        return {
          table: {
            widths: '*',
            body: [
              // [
              //   { image: logos.signature, colSpan: 3, alignment: 'center', fit: [300, 43]},
              //   {},
              //   {},
              // ],
              [
                { text: 'https://covidgoias.ufg.br/', alignment: 'left', style: 'textFooter', margin: [20, 0, 0, 0] },
                { text: moment().format('DD/MM/YYYY HH:mm:ss'), alignment: 'center', style: 'textFooter', margin: [0, 0, 0, 0] },
                { text: logos.page.title[language] + currentPage.toString() + logos.page.of[language] + '' + pageCount, alignment: 'right', style: 'textFooter', margin: [0, 0, 20, 0] },
              ],
            ]
          },
          layout: 'noBorders'
        };
      },
      content: [],
      styles: {
        titleReport: {
          fontSize: 16,
          bold: true
        },
        textFooter: {
          fontSize: 9
        },
        textImglegend: {
          fontSize: 9
        },
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        data: {
          bold: true,
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        codCar: {
          fontSize: 11,
          bold: true,
        },
        textObs: {
          fontSize: 11,
        },
        tableDpat: {
          margin: [0, 5, 0, 15],
          fontSize: 11,
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        },
        metadata: {
          background: '#0b4e26',
          color: '#fff'
        }
      }
    }

    let canvasToBase64Map = async function () {
      let canvas = await html2canvas(document.querySelector(".ol-viewport"));
      return canvas.toDataURL('image/png');
    }
    // @ts-ignore
    dd.content.push({ image: await canvasToBase64Map(), width: 850, alignment: 'center', margin: [40, 10, 2, 0] })

    let filename = 'map.pdf'
    pdfMake.createPdf(dd).download(filename);
  }

  private updateSummary() {
    let sourceUrl = '/service/summary/data' + this.getServiceParams();

    this.http.get(sourceUrl).subscribe(result => {
      this.summary = result['resumed'];

      if (this.summary.confirmados == null) {
        this.summary.confirmados = "0"
      }

      if (this.summary.obitos == null) {
        this.summary.obitos = "0"
      }
      this.lastUpdate = result['last_update']

    });

    let sumBoxURL = '/service/summary/texts' + this.getServiceParams();

    this.http.get(sumBoxURL).subscribe(result => {
      this.textSummary = result;

      let sp = this.textSummary.title.split("?")
      let tmp = ''

      if (this.selectRegion.cd_geocmu == '52') {
        if (this.language == 'pt-br') {
          tmp = "Estado"
        }
        else {
          tmp = "State"
        }
      }
      else {
        if (this.language == 'pt-br') {
          tmp = "Município"
        }
        else {
          tmp = "Municipality"
        }
      }
      if (this.selectRegion.cd_geocmu == '5300108') {
        let tmp;
        if (this.language == 'pt-br') {
          tmp = "Distrito Federal"
        }
        else {
          tmp = "Federal Disctrict"
        }
        this.textSummary.title = sp[0] + tmp
      } else {
        this.textSummary.title = sp[0] + tmp + sp[1] + this.selectRegion.nome
      }

    });

  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerHeigth = window.innerHeight;
    if (window.innerWidth < 1480) {
      this.currentZoom = 6.2;
    } else {
      this.currentZoom = 7.6;
    }

    if (window.innerWidth < 1024) {
      this.router.navigate(['/mobile']);
    }

    this.innerWidth = window.innerWidth;
  }

  handleDrawer() {
    this.showDrawer = !this.showDrawer;
  }

  zoomIn() {
    this.map.getView().setZoom(this.map.getView().getZoom() + 0.7)
    this.googleAnalyticsService.eventEmitter("controll", "zomm", "zoomin");
  }

  zoomOut() {
    this.map.getView().setZoom(this.map.getView().getZoom() - 0.7)
    this.googleAnalyticsService.eventEmitter("controll", "zomm", "zoomout");
  }

  handleAnalytics(eventName, eventCategory, eventAction) {
    this.googleAnalyticsService.eventEmitter(eventName, eventCategory, eventAction);

  }

  openDialogAjuda() {
    let dialogRef = this.dialog.open(HelpComponent, {
      width: '90%',
      height: '90%',
      data: { controls: this.controls }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }

  openDialogBeds() {
    let dialogRef = this.dialog.open(BedsComponent, {
      width: '90%',
      height: '90%',
      data: { controls: this.controls }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }

  openDialogCharts(charts, index = 0) {

    let dialogRef = this.dialog.open(DialogChartsComponent, {
      width: '90%',
      height: '90%',
      data: { index: index, dados: this[charts] }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }


  exportPdf(table) {
    let self = this;
    let language = this.language;
    let tablename = '';
    let ob = [];
    let titleTable = [];

    if (table == 'cities') {
      tablename = this.chartResultCities.filename;
      ob = this.chartResultCities.series;
      titleTable = this.exportColumnsCities;
    }
    else {
      tablename = this.neighborhoodsCharts.filename;
      ob = this.neighborhoodsCharts.series;
      titleTable = this.exportColumnsBairros;
    }

    import("jspdf").then(jsPDF => {
      import("jspdf-autotable").then(x => {
        const doc = new jsPDF.default(0, 0);
        let totalDePaginas = "{total_pages_count_string}";

        let header = function () {
          let title = logos.title[language].toLocaleUpperCase()
          doc.setFontType('bold');
          doc.setFontSize(12);
          doc.text(logos.title.left, logos.title.top, title);
          doc.addImage(logos.logoCovid, 'PNG', 15, 5, 45, 20);

          doc.addImage(
            logos[self.selectRegion.cd_geocmu].logo.img,
            'PNG',
            logos[self.selectRegion.cd_geocmu].logo.left,
            logos[self.selectRegion.cd_geocmu].logo.top,
            logos[self.selectRegion.cd_geocmu].logo.width,
            logos[self.selectRegion.cd_geocmu].logo.height
          );

          doc.addImage(logos.logoUFG, 'PNG', 156, 5, 40, 20);

        };

        let footer = function () {
          var paginas = logos.page.title[language] + doc.internal.getNumberOfPages();
          if (typeof doc.putTotalPages === 'function') {
            paginas = paginas + logos.page.of[language] + totalDePaginas;
          }

          doc.setFontSize(9);
          doc.setFontType('normal');

          doc.text(logos[self.selectRegion.cd_geocmu].footer.text[language], logos[self.selectRegion.cd_geocmu].footer.left, doc.internal.pageSize.height - 10);

          doc.setFontType('normal');
          doc.text(paginas, 175, doc.internal.pageSize.height - 5);
          doc.text("https://covidgoias.ufg.br", 15, doc.internal.pageSize.height - 5);
          doc.text(moment().format('DD/MM/YYYY HH:mm:ss'), 90, doc.internal.pageSize.height - 5);
        };

        let options = {

          margin: {
            top: 40,
          },

          didDrawPage: function (data) {
            // Header
            header();
            // Footer
            footer();
          },

          //'everyPage' = mostra o cabeçalho a cada página
          //'firstPage' = mostra o cabeçalho apenas na primeira página
          //'never'     = nunca mostra o cabeçalho
          showHead: 'everyPage',
          theme: 'striped', // 'striped', 'grid' or 'plain'
          startY: false //doc.autoTableEndPosY() + 60
        };

        doc.autoTable(titleTable, ob, options);

        if (typeof doc.putTotalPages === 'function') {
          doc.putTotalPages(totalDePaginas);
        }
        doc.save(tablename + this.selectRegion.nome + '.pdf');
      })
    })
  }

  exportPdfDeaths(table) {
    let self = this;
    let language = this.language;
    let tablename = '';
    let ob = [];
    let titleTable = [];

    tablename = this.deathsCharts.filename;
    ob = this.deathsCharts.series;
    titleTable = this.exportColumnsBairrosDeaths;

    import("jspdf").then(jsPDF => {
      import("jspdf-autotable").then(x => {
        const doc = new jsPDF.default(0, 0);
        let totalDePaginas = "{total_pages_count_string}";

        let header = function () {
          let title = logos.title_deaths[language].toLocaleUpperCase()
          doc.setFontType('bold');
          doc.setFontSize(12);
          doc.text(logos.title_deaths.left, logos.title_deaths.top, title);
          doc.addImage(logos.logoCovid, 'PNG', 15, 5, 45, 20);

          doc.addImage(
            logos[self.selectRegion.cd_geocmu].logo.img,
            'PNG',
            logos[self.selectRegion.cd_geocmu].logo.left,
            logos[self.selectRegion.cd_geocmu].logo.top,
            logos[self.selectRegion.cd_geocmu].logo.width,
            logos[self.selectRegion.cd_geocmu].logo.height
          );

          doc.addImage(logos.logoUFG, 'PNG', 156, 5, 40, 20);

        };

        let footer = function () {
          var paginas = logos.page.title[language] + doc.internal.getNumberOfPages();
          if (typeof doc.putTotalPages === 'function') {
            paginas = paginas + logos.page.of[language] + totalDePaginas;
          }

          doc.setFontSize(9);
          doc.setFontType('normal');

          doc.text(logos[self.selectRegion.cd_geocmu].footer.text[language], logos[self.selectRegion.cd_geocmu].footer.left, doc.internal.pageSize.height - 10);

          doc.setFontType('normal');
          doc.text(paginas, 175, doc.internal.pageSize.height - 5);
          doc.text("https://covidgoias.ufg.br", 15, doc.internal.pageSize.height - 5);
          doc.text(moment().format('DD/MM/YYYY HH:mm:ss'), 90, doc.internal.pageSize.height - 5);
        };

        let options = {

          margin: {
            top: 40,
          },

          didDrawPage: function (data) {
            // Header
            header();
            // Footer
            footer();
          },

          //'everyPage' = mostra o cabeçalho a cada página
          //'firstPage' = mostra o cabeçalho apenas na primeira página
          //'never'     = nunca mostra o cabeçalho
          showHead: 'everyPage',
          theme: 'striped', // 'striped', 'grid' or 'plain'
          startY: false //doc.autoTableEndPosY() + 60
        };

        doc.autoTable(titleTable, ob, options);

        if (typeof doc.putTotalPages === 'function') {
          doc.putTotalPages(totalDePaginas);
        }
        doc.save(tablename + this.selectRegion.nome + '.pdf');
      })
    })
  }

  handleRestrictedArea() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.width = '40%';
    dialogConfig.id = "modal-restricted-area-access";
    dialogConfig.data = { lang: this.language };

    let dialogRestrictedAreaAccess = this.dialog.open(RestrictedAreaAccessComponent, dialogConfig);

    dialogRestrictedAreaAccess.componentInstance.userEvent.subscribe((user) => {
      this.user = user;
      this.updateRegion(user);
      this.restrictedArea = true;
      dialogRestrictedAreaAccess.close();
    });

    dialogRestrictedAreaAccess.componentInstance.requireAccess.subscribe(() => {
      const dialogConfig = new MatDialogConfig();

      dialogConfig.disableClose = false;
      dialogConfig.id = "modal-restricted-area-form";

      let restrictedAreaFormRef = this.dialog.open(RestrictedAreaFormComponent, dialogConfig);
      restrictedAreaFormRef.componentInstance.msgEvent.subscribe((msg) => {
        this.display = true;
        this.msg = msg;
        restrictedAreaFormRef.close();
      });

      dialogRestrictedAreaAccess.close();
    });

  }

  formatRateLabel = (v) => {
    return (value: number) => {
      if (this.dates[value] != undefined) {
        return this.dates[value].data_rotulo;
      }
    }
  };

  formatRateLabelProjections = (v) => {
    return (value: number) => {
      if (this.datesProjections[value] != undefined) {
        return this.datesProjections[value].data_rotulo;
      }
    }
  };

  formatRateLabelTemperatures = (v) => {
    return (value: number) => {
      if (this.datesTemperatures[value] != undefined) {
        return this.datesTemperatures[value].f_data_previsao;
      }
    }
  };

  onProjectionsChange(event) {

    let lay = this.projectionsLayers.find(element => element.value === this.selectedProjectionLayer);
    this.labelProjections = this.controls.text_projections
      .replace('[weeks]', this.datesProjections.length)
      .replace('[layer]', lay.label.toLowerCase());

    if (isNaN(event.value)) {
      event.value = 0;
    }

    let self = this;
    this.layersNames.forEach(function (item) {
      self.changeVisibility(item, { checked: false });
    });


    let p = this.layersNames.find(element => element.id === 'projecoes_luisa');
    p.selectedType = this.selectedProjectionLayer;
    let layer = p.types.find(element => element.value === p.selectedType);
    layer.layerfilter = "data = '" + this.datesProjections[event.value].data_db + "'"
    this.urlLegendProjections = layer.urlLegend;

    this.changeVisibility(p, { checked: true });

    this.updateSourceLayer(layer);
  }

  onTemperaturesChange(event) {
    this.labelProjections = this.controls.text_temperatures

    if (isNaN(event.value)) {
      event.value = 0;
    }

    let self = this;
    this.layersNames.forEach(function (item) {
      self.changeVisibility(item, { checked: false });
    });

    let p = this.layersNames.find(element => element.id === 'clima_temperatura');

    let layer = p.types.find(element => element.value === 'clima_temperatura_em_goias')
    layer.layerfilter = "data_previsao_utc = '" + this.datesTemperatures[event.value].data_previsao_utc + "'"
    this.urlLegendTemperatures = layer.urlLegend;

    // console.log(layer)
    // console.log(this.datesTemperatures)
    // console.log(this.datesTemperatures[event.value])

    this.changeVisibility(p, { checked: true });

    this.updateSourceLayer(layer);
  }

  onSliderChange(event) {

    this.selectedConfirmedDate = this.dates[event.value].data_db

    if (this.selectRegion.cd_geocmu != '52') {

      this.selectedBairroTime = "'" + this.dates[event.value].data_db + "'";
      let p = this.layersNames.find(element => element.id === 'casos_bairro');
      let layer = p.types.find(element => element.value === 'casos_por_bairro_covid');
      layer.layerfilter = " cd_geocmu= '" + this.selectRegion.cd_geocmu + "' AND data_ultima_atualizacao = '" + this.dates[event.value].data_db + "'";

      // console.log("LAYER", layer);
      this.updateSourceLayer(layer);

    } else {
      let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
      let layer = p.types.find(element => element.value === 'covid19_municipios_casos')
      layer.layerfilter = "date_trunc('day', data) = '" + this.dates[event.value].data_db + "'"

      this.updateSourceLayer(layer);
    }

    // for (let url of this.urls) {
    //   result.push(url + '?layers=' + layername + msfilter + '&mode=tile&tile={x}+{y}+{z}' + '&tilemode=gmap' + '&map.imagetype=png');
    // }

  }

  handleSlider() {
    let lastDay = this.dates.length - 1;
    this.showSlider = !this.showSlider;
    this.onSliderChange({ value: lastDay });
  }

  handleProjections() {

    let lay = this.projectionsLayers.find(element => element.value === this.selectedProjectionLayer);
    this.labelProjections = this.controls.text_projections.replace('[weeks]', this.datesProjections.length).replace('[layer]', lay.label.toLowerCase());

    this.showProjections = !this.showProjections;
    let self = this;
    this.layersNames.forEach(function (item) {
      self.changeVisibility(item, { checked: false });
    });

    let y = this.layersNames.find(element => element.id === 'projecoes_luisa');
    this.changeVisibility(y, { checked: true });

    if (this.showProjections) {
      this.onProjectionsChange({ value: 0 });
    } else {

      this.layersNames.forEach(function (item) {
        self.changeVisibility(item, { checked: false });
      });

      let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
      this.changeVisibility(p, { checked: true });
    }

  }

  handleTemperatures() {

    this.labelTemperatures = this.controls.text_temperatures
    this.showTemperatures = !this.showTemperatures;

    let self = this;

    this.layersNames.forEach(function (item) {
      self.changeVisibility(item, { checked: false });
    });

    if (this.showTemperatures) {
      this.onTemperaturesChange({ value: 0 });
    } else {

      this.layersNames.forEach(function (item) {
        self.changeVisibility(item, { checked: false });
      });

      let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
      this.changeVisibility(p, { checked: true });
    }

  }

  getClassByIqa(iqa) {
    let classes = "";

    switch (iqa) {
      case 'boa':
        classes = 'iqa iqa-boa'
        break;
      case 'moderada':
        classes = 'iqa iqa-moderada'
        break;
      case 'ruim (grupos de risco)':
        classes = 'iqa iqa-ruim-grupo-risco'
        break;
      case 'ruim':
        classes = 'iqa iqa-ruim'
        break;
      case 'pessimo':
        classes = 'iqa iqa-pessimo'
        break;
      case 'critico':
        classes = 'iqa iqa-critico'
        break;
    }
    return classes;

  }

  downloadHistorico() {
    this.http.get("/service/download/confirmados", { responseType: 'blob' })
      .toPromise()
      .then(blob => {
        saveAs(blob, 'casos_confirmados.csv');
      }).catch(err => console.log(err));

    this.http.get("/service/download/obitos", { responseType: 'blob' })
      .toPromise()
      .then(blob => {
        saveAs(blob, 'obitos_confirmados.csv');
      }).catch(err => console.log(err));
  }

  showDialogUTFGrid() {
    let dialog = { visibility: 'hidden' };

    if (this.infodata) {
      dialog.visibility = 'visible'
    }

    if (this.infobairro) {
      dialog.visibility = 'visible'
    }
    if (this.infobairroObitos) {
      dialog.visibility = 'visible'
    }

    if (this.infoTendencias) {
      dialog.visibility = 'visible'
    }

    if (this.infoTemperatures) {
      dialog.visibility = 'visible'
    }

    if (this.clickable) {
      dialog.visibility = 'visible'
    }

    return dialog;
  }

  ngOnInit() {
    let descriptorURL = '/service/map/descriptor' + this.getServiceParams();

    this.http.get(descriptorURL).subscribe(result => {
      this.descriptor = result;
      this.regionFilterDefault = this.descriptor.regionFilterDefault;


      for (let group of this.descriptor.groups) {
        for (let layer of group.layers) {
          if (layer.id != 'satelite') {
            for (let type of layer.types) {
              if (type.source == 'geojson') {
                type.urlLegend = type.iconUrl
              } else if (type.source == 'external') {
                type.urlLegend = type.legendUrl
              }
              else {
                type.urlLegend = this.urls[0] + '?TRANSPARENT=TRUE&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&layer=' + type.value + '&format=image/png';
              }
            }
            this.layersNames.push(layer);
          }

          for (let layerType of layer.types) {
            layerType.visible = false;
            if (layer.selectedType == layerType.value) {
              layerType.visible = layer.visible;
            }

            this.layersTypes.push(layerType);
            this.layersTypes.sort(function (e1, e2) {
              return e2.order - e1.order;
            });
          }
        }
      }

      for (let basemap of this.descriptor.basemaps) {
        for (let types of basemap.types) {
          this.basemapsNames.push(types);
        }
      }

      for (let limits of this.descriptor.limits) {
        for (let types of limits.types) {
          this.limitsNames.push(types);
        }
      }

      this.createMap();
    });
    // keep height of window
    this.innerHeigth = window.innerHeight;

    if (window.innerWidth < 1480) {
      this.currentZoom = 6.2;
    } else {
      this.currentZoom = 7.6;
    }

    // Register of SVG icons
    this.matIconRegistry.addSvgIcon(
      `info`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/info.svg')
    );

    this.matIconRegistry.addSvgIcon(
      `shp`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/shp.svg')
    );

    this.matIconRegistry.addSvgIcon(
      `csv`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/csv.svg')
    );

    // if (window.innerWidth < 1024) {
    //   this.router.navigate(['/mobile']);
    // }

  }
}
