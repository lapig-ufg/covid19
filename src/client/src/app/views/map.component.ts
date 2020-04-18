import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, HostListener, Injectable, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
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

import { GoogleAnalyticsService } from '../services/google-analytics.service';
import { HelpComponent } from "./help/help.component";
import { RestrictedAreaAccessComponent } from "./restricted-area-access/restricted-area-access.component";
import { RestrictedAreaFormComponent } from "./restricted-area-form/restricted-area-form.component";
import * as moment from 'moment';

let SEARCH_URL = '/service/map/search';
let PARAMS = new HttpParams({
  fromObject: {
    format: 'json'
  }
});

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
  map: OlMap;
  layers: Array<TileWMS>;
  tileGrid: TileGrid;
  projection: OlProj;
  currentZoom: Number;
  regionsLimits: any;
  dataSeries: any;
  dataProjSeries: any;
  dataStates: any;
  dataCities: any;
  dataSource: any;
  neighborhoodsCharts: any;

  chartResultCities: any;
  chartResultCitiesIllegalAPP: any;
  chartResultCitiesIllegalRL: any;
  desmatInfo: any;

  optionsStates: any
  textSummary: any

  changeTabSelected = "";
  viewWidth = 600;
  viewWidthMobile = 350;
  chartRegionScale: boolean;

  trafficgoogle: any;
  exportColumns: any[];
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
  infodataMunicipio: any;
  fieldPointsStop: any;
  utfgridsource: UTFGrid;
  utfgridlayer: OlTileLayer;
  utfgridBairro: UTFGrid;
  utfgridlayerBairro: OlTileLayer;
  utfgridmunicipio: UTFGrid;
  utfgridlayerMunicipio: OlTileLayer;
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
  showSlider: boolean;

  @ViewChild("drawer", { static: false }) drawer: ElementRef;
  selectedConfirmedDate: any;

  constructor(
    private http: HttpClient,
    private _service: SearchService,
    public dialog: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public googleAnalyticsService: GoogleAnalyticsService,
    private router: Router
  ) {

    this.projection = OlProj.get('EPSG:900913');
    this.currentZoom = 7.6;
    this.layers = [];

    this.dataSeries = { timeseries: { label: "", chartResult: [] } };
    this.dataProjSeries = { timeseries: { label: "", chartResult: [] } };
    this.dataStates = {};

    this.clickableTitle = 'Informações não disponíveis';

    this.chartResultCities = {
      split: []
    };
    this.textSummary = {};

    this.infomarker = {};
    this.infobairro = {};

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

    this.neighborhoodsCharts = {}

    this.optionsStates = {};
    this.statistics_county = { result: {}, text: {} };
    this.valueRegion = '';

    this.changeTabSelected = "";

    this.urls = [
      'https://o1.lapig.iesa.ufg.br/ows',
      'https://o2.lapig.iesa.ufg.br/ows',
      'https://o3.lapig.iesa.ufg.br/ows',
      'https://o4.lapig.iesa.ufg.br/ows'
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

    this.desmatInfo = {
      value: 'year=2019',
      Viewvalue: '2018/2019',
      year: 2019
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
    this.selectedBairroTime = '(select max(data_ultima_atualizacao) from v_casos_bairros)'

    this.bntStyleENG = this.styleDefault;
    this.bntStylePOR = this.styleSelected;

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
    let name = event.data.name;

    this.http.get(SEARCH_URL, { params: PARAMS.set('key', name) }).subscribe(result => {
      let ob = result[0];

      this.currentData = ob.text;
      this.updateRegion(ob);

    });
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
      }
      else {
        if (this.language == 'pt-br') {
          tmp = "Município"
        }
        else {
          tmp = "Municipality"
        }
      }
      this.textSummary.title = sp[0] + tmp + sp[1] + this.selectRegion.nome
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

  private updateCharts() {

    let timeseriesUrl = '/service/indicators/timeseries' + this.getServiceParams();

    this.http.get(timeseriesUrl).subscribe(result => {

      this.dataSeries = result;

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

        // graphic.options.legend.onHover = function (event) {
        //   event.target.style.cursor = 'pointer';
        //   graphic.options.legend.labels.fontColor = '#0335fc';
        // };

        // graphic.options.legend.onLeave = function (event) {
        //   event.target.style.cursor = 'default';
        //   graphic.options.legend.labels.fontColor = '#fa1d00';
        // };

        graphic.options.legend.onClick = function (event) {
          return null;
        };

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

      }

    }
    );

    let citiesUrl = '/service/indicators/cities' + this.getServiceParams();

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

      this.exportColumns = this.chartResultCities.split.map(col => ({ title: col.header, dataKey: col.field }));

      // console.log(this.chartResultCities)

    });


    let neighborhoodsUrl = '/service/indicators/neighborhoods' + this.getServiceParams() + '&timefilter=' +this.selectedBairroTime;

    this.http.get(neighborhoodsUrl).subscribe(citiesResult => {
      this.neighborhoodsCharts = citiesResult;

      this.neighborhoodsCharts.label += this.selectRegion.nome

      let d = new Date(this.neighborhoodsCharts.last_updated)

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

      this.exportColumns = this.neighborhoodsCharts.split.map(col => ({ title: col.header, dataKey: col.field }));

      // console.log(this.neighborhoodsCharts)

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

        // graphic.options.legend.onHover = function (event) {
        //   event.target.style.cursor = 'pointer';
        //   graphic.options.legend.labels.fontColor = '#0335fc';
        // };

        // graphic.options.legend.onLeave = function (event) {
        //   event.target.style.cursor = 'default';
        //   graphic.options.legend.labels.fontColor = '#fa1d00';
        // };

        graphic.options.legend.onClick = function (event) {
          return null;
        };

        graphic.options.tooltips.filter = function (tooltipItem, data) {

          var label = new Date(data.labels[tooltipItem.index]);
          let compr = new Date(graphic.last_model_date)

          if (label >= compr) {
            return tooltipItem.datasetIndex === 0;
          }
          else {
            return tooltipItem;
          }
        }

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

      this.isFilteredByCity = false;
    }
    else {
      this.isFilteredByCity = true;
    }

    this.currentData = region.nome;
    this.valueRegion = region.nome;

    this.selectRegion = region;
    this.selectRegion.nome = this.captalizeCity(this.selectRegion.nome);

    if(this.selectRegion.cd_geocmu == '5208707'){
      this.getDates('/service/indicators/datesNeighborhoods');
    }else{
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
      if (layer.timeSelected == "cd_geocmu = '52'") { }
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
          // let l = this.layersNames.find(element => element.id === 'urban_traffic');
          // this.changeVisibility(l, { checked: true });
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

    let coordinate = this.map.getEventCoordinate(evt.originalEvent);
    let viewResolution = this.map.getView().getResolution();

    var feature = this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      return feature;
    });

    this.infoOverlay.setPosition(coordinate);

    // console.log(feature)

    if (feature) {
      this.clickable = true
      var properties = feature.getProperties();
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
      if (bairro.visible) {

        let zoom = this.map.getView().getZoom();

        if (this.utfgridBairro) {
          this.utfgridBairro.forDataAtCoordinateAndResolution(coordinate, viewResolution, function (data) {
            if (data && data.numpoints > 0) {
              // window.document.body.style.cursor = 'pointer';

              this.infobairro = data;
              
              if (this.infobairro.nome == "") {
                this.infobairro.nome = this.minireportText.undisclosed_message;
              }
              // console.log(this.infobairro)

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
            // console.log(layerinfo, data)
            if (layerinfo.selectedType == 'covid19_municipios_casos') {
              this.http.get(SEARCH_URL, { params: PARAMS.set('key', data.nome) }).subscribe(result => {

                let ob = result[0];
                this.updateRegion(ob);
                let l = this.layersNames.find(element => element.id === 'urban_traffic');
                this.changeVisibility(l, { checked: true });
                let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
                this.changeVisibility(p, { checked: false });
                this.infodata = null
              });
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
            'https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
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

    this.utfgridlayerBairro = new OlTileLayer({
      source: this.utfgridBairro
    });

    this.layers.push(this.utfgridlayer);
    this.layers.push(this.utfgridlayerBairro)

    this.layers = this.layers.concat(olLayers.reverse());
  }

  private getTileJSON() {

    let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');

    let layer = p.types.find(element => element.value === 'covid19_municipios_casos')


    if (this.selectedConfirmedDate == '') {
      layer.layerfilter = "data = (select max(data) from municipios_casos)"
    } else {
      layer.layerfilter = "data = '" + this.selectedConfirmedDate + "'"
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

      if(this.selectRegion.cd_geocmu == '5208707' && this.showSlider){
        layer.timeSelected = "cd_geocmu = '5208707' AND " + layer.layerfilter;
      }

      if (layer.timeHandler == 'msfilter' && layer.times) {
        filters.push(layer.timeSelected);
      }
      if (layer.layerfilter) { filters.push(layer.layerfilter); }
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

    if (covid.visible || bairros.visible) {

      if (covid.selectedType == 'covid19_municipios_casos') {

        if (this.utfgridsource) {
          let tileJSON = this.getTileJSON();

          this.utfgridsource.tileUrlFunction_ = _ol_TileUrlFunction_.createFromTemplates(tileJSON.grids, this.utfgridsource.tileGrid);
          this.utfgridsource.tileJSON = tileJSON;
          this.utfgridsource.refresh();

          this.utfgridlayer.setVisible(true);
        }
      }

      if (bairros.selectedType == 'casos_por_bairro_covid') {
        if (this.utfgridBairro) {
          let tileJSONBairro = this.getTileJSONBairros();

          this.utfgridBairro.tileUrlFunction_ = _ol_TileUrlFunction_.createFromTemplates(tileJSONBairro.grids, this.utfgridBairro.tileGrid);
          this.utfgridBairro.tileJSON = tileJSONBairro;
          this.utfgridBairro.refresh();

          this.utfgridlayerBairro.setVisible(true);
        }
      }


    } else if (this.utfgridsource && this.utfgridBairro) {
      this.utfgridlayer.setVisible(false);
      this.utfgridlayerBairro.setVisible(false);
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

    // if(layer.id == "casos_bairro")
    // {
    //   this.zoomToCityOnTypesLayer(layer)
    // }
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

  openDialogMetadata(layer) {

    let metadata = [];
    let self = this;

    if (layer.hasOwnProperty('metadata')) {
      metadata = this.getMetadata(layer.metadata);
    } else {
      let selectedType = layer.selectedType;
      layer.types.forEach(function (type) {
        if (type.value == selectedType) {
          metadata = self.getMetadata(type.metadata);
        }
      });
    }

    let dialogRef = this.dialog.open(MetadataComponent, {
      width: '130vh',
      data: { metadata }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
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
      this.textSummary.title = sp[0] + tmp + sp[1] + this.selectRegion.nome

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
      data: {controls: this.controls}
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }

  exportPdf(table) {
    let tablename = ''
    let ob = [];

    if (table == 'cities') {
      tablename = this.chartResultCities.filename
      ob = this.chartResultCities.series
    }
    else {
      tablename = this.neighborhoodsCharts.filename
      ob = this.neighborhoodsCharts.series
    }

    import("jspdf").then(jsPDF => {
      import("jspdf-autotable").then(x => {
        const doc = new jsPDF.default(0, 0);
        let totalDePaginas = "{total_pages_count_string}";

        let header = function() {
          let title = 'Casos confirmados'.toLocaleUpperCase()
          doc.setFontType('bold');
          doc.setFontSize(12);
          doc.text(85, 18, title);
          let logoCovid = 'data:image/png;base64,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';
          let logoUFG   = 'data:image/png;base64,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';
          doc.addImage(logoCovid, 'PNG', 15, 5, 40, 20);
          doc.addImage(logoUFG, 'PNG', 156, 5, 40, 20);
        };

        let footer = function() {
          var paginas = "Página " + doc.internal.getNumberOfPages();
          if (typeof doc.putTotalPages === 'function') {
            paginas = paginas + " de " + totalDePaginas;
          }

          doc.setFontSize(9);
          doc.setFontType('normal');

          doc.setFontType('normal');
          doc.text(paginas, 180, doc.internal.pageSize.height - 10);
          doc.text( moment().format('DD/MM/YYYY HH:mm:ss'), 90, doc.internal.pageSize.height - 10);
        };

        let options = {

          margin: {
            top:30,
          },

          didDrawPage: function(data) {
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

        doc.autoTable(this.exportColumns, ob, options);

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

  onSliderChange(event) {

    this.selectedConfirmedDate = this.dates[event.value].data_db

    if(this.selectRegion.cd_geocmu == '5208707'){

      this.selectedBairroTime = "'" + this.dates[event.value].data_db + "'";
      let p = this.layersNames.find(element => element.id === 'casos_bairro');
      let layer = p.types.find(element => element.value === 'casos_por_bairro_covid')
      layer.layerfilter = "data_ultima_atualizacao = '" + this.dates[event.value].data_db + "'"

      this.updateSourceLayer(layer);

    }else{
      let p = this.layersNames.find(element => element.id === 'casos_covid_confirmados');
      let layer = p.types.find(element => element.value === 'covid19_municipios_casos')
      layer.layerfilter = "data = '" + this.dates[event.value].data_db + "'"

      this.updateSourceLayer(layer);
    }





    // for (let url of this.urls) {
    //   result.push(url + '?layers=' + layername + msfilter + '&mode=tile&tile={x}+{y}+{z}' + '&tilemode=gmap' + '&map.imagetype=png');
    // }

  }

  handleSlider(){
    let lastDay = this.dates.length - 1;
    this.showSlider = !this.showSlider;
    this.onSliderChange({value: lastDay});
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

    if (window.innerWidth < 1024) {
      this.router.navigate(['/mobile']);
    }

    // this.exportColumns = this.cols.map(col => ({title: col.header, dataKey: col.field}));
  }
}