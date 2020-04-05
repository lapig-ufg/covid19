import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, HostListener, Injectable, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog, MatDialogConfig  } from '@angular/material';
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

import { google } from "google-maps";

import { GoogleAnalyticsService } from '../services/google-analytics.service';
import { HelpComponent } from "./help/help.component";
import {RestrictedAreaAccessComponent} from "./restricted-area-access/restricted-area-access.component";
import {RestrictedAreaFormComponent} from "./restricted-area-form/restricted-area-form.component";

import TEAM from './team.js';

import OLGoogleMaps from 'olgm/OLGoogleMaps.js';
import GoogleLayer from 'olgm/layer/Google.js';

/// <reference types="@types/googlemaps" />


declare var google: google;

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
  chartResultCities: any;
  chartResultCitiesIllegalAPP: any;
  chartResultCitiesIllegalRL: any;
  chartUsoSolo = [] as any;
  periodSelected: any;
  desmatInfo: any;

  optionsStates: any
  textSummary: any

  changeTabSelected = "";
  viewWidth = 600;
  viewWidthMobile = 350;
  chartRegionScale: boolean;

  trafficgoogle: any;

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
  infodataCampo: any;
  infodataMunicipio: any;
  fieldPointsStop: any;
  utfgridsource: UTFGrid;
  utfgridlayer: OlTileLayer;
  utfgridCampo: UTFGrid;
  utfgridlayerCampo: OlTileLayer;
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

  restrictedArea:boolean;
  user:any;

  msg:any;
  display:boolean;
  team:any

  @ViewChild("drawer", { static: false }) drawer: ElementRef;

  constructor(
    private http: HttpClient,
    private _service: SearchService,
    public dialog: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public googleAnalyticsService: GoogleAnalyticsService
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
    this.chartResultCitiesIllegalAPP = {};
    this.chartResultCitiesIllegalRL = {};
    this.chartUsoSolo = [];

    this.textSummary = {};

    this.defaultRegion = {
      nome: 'Goiás',
      area_mun: 1547.26991096032,
      estado: 'GOIÁS',
      uf: 'GO',
      cd_geocmu: '52'
    };
    this.selectRegion = this.defaultRegion;

    this.textOnDialog = {};

    this.currentData = "";

    this.optionsStates = {};
    this.statistics_county = { result: {}, text: {}};
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

    this.periodSelected = {
      value: 'year=2019',
      Viewvalue: '2018/2019',
      year: 2019
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

    this.bntStyleENG = this.styleDefault;
    this.bntStylePOR = this.styleSelected;

    this.updateCharts();
    this.chartRegionScale = true;
    this.titlesLayerBox = {};
    this.minireportText = {};
    this.updateSource();

    this.updateTexts();

    this.showStatistics = true;
    this.showDrawer = false;
    this.dataSource = {};
    this.summary = {};
    this.lastUpdate = {};
    this.updateSummary();

    this.restrictedArea = false;
    this.user = {};
    this.display = false;
    this.team = TEAM;
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
      map.getView().fit(extent, { duration: 1500 });

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
        else{
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

        graphic.options.legend.onHover = function (event) {
          event.target.style.cursor = 'pointer';
          graphic.options.legend.labels.fontColor = '#0335fc';
        };

        graphic.options.legend.onLeave = function (event) {
          event.target.style.cursor = 'default';
          graphic.options.legend.labels.fontColor = '#fa1d00';
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
      this.chartResultCities.split = this.chartResultCities.title.split('?');

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
          graphic.options.legend.labels.fontColor = '#0335fc';
        };

        graphic.options.legend.onLeave = function (event) {
          event.target.style.cursor = 'default';
          graphic.options.legend.labels.fontColor = '#fa1d00';
        };

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

      console.log(this.statistics_county)
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

      this.isFilteredByCity = false;
    }
    else{
      this.isFilteredByCity = true;
    }

    this.currentData = region.nome;
    this.valueRegion = region.nome;

    this.selectRegion = region;
    this.selectRegion.nome = this.captalizeCity(this.selectRegion.nome)

    // if (this.selectRegion.type == 'city') {
    //   this.msFilterRegion = ' cd_geocmu = \'' + this.selectRegion.cd_geocmu + '\'';

    //   this.isFilteredByState = true;
    //   this.selectRegion.regionTypeBr = 'Município de ';
    // } else if (this.selectRegion.type == 'state') {
    //   this.msFilterRegion = 'uf = \'' + this.selectRegion.value + '\'';
    //   this.isFilteredByState = true;
    // } else { this.msFilterRegion = ""; }
    this.updateCharts();
    this.updateExtent();
    this.updateSourceAllLayer();
    this.updateSummary();
    this.googleAnalyticsService.eventEmitter("updateRegion", "search_box", this.valueRegion);
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

    let coordinate = this.map.getEventCoordinate(evt.originalEvent);
    let viewResolution = this.map.getView().getResolution();


    var feature = this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      return feature;
    });

    this.infoOverlay.setPosition(coordinate);

    if (feature) {
      this.clickable = true
      var properties = feature.getProperties();
      window.document.body.style.cursor = 'pointer';

      if (properties['label'] != undefined) {
        this.clickableTitle = properties['label']
      }

    } else {
      this.clickableTitle = this.minireportText.label_clickable
      this.clickable = false
      window.document.body.style.cursor = 'auto';

      let info = this.layersNames.find(element => element.id === 'casos_covid_confirmados');

      // if (info.visible) {

        if (info.selectedType == "covid19_municipios_casos") {

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
      // }

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

    this.layers.push(this.utfgridlayer);

    this.layers = this.layers.concat(olLayers.reverse());
  }

  private getTileJSON() {

    let filter = true;

    return {
      version: '2.2.0',
      grids: [
        this.returnUTFGRID('covid19_municipios_casos_utfgrid', filter, '{x}+{y}+{z}')
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

      if (layer.timeHandler == 'msfilter' && layer.times) {
        filters.push(layer.timeSelected);
      }

      if (layer.layerfilter) { filters.push(layer.layerfilter); }
      if (this.regionFilterDefault != "") { filters.push(this.regionFilterDefault); }
      if (layer.regionFilter) {
        this.msFilterRegion = "uf = 'GO'"
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
    if (layer['times']) {
      this.periodSelected = layer['times'].find(
        element => element.value === layer.timeSelected
      );
    }

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

    if (covid.visible) {
      if (this.utfgridsource) {
        let tileJSON = this.getTileJSON();

        this.utfgridsource.tileUrlFunction_ = _ol_TileUrlFunction_.createFromTemplates(tileJSON.grids, this.utfgridsource.tileGrid);
        this.utfgridsource.tileJSON = tileJSON;
        this.utfgridsource.refresh();

        this.utfgridlayer.setVisible(true);
      }
    } else if (this.utfgridsource) {
      this.utfgridlayer.setVisible(false);
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

    if (layer.id == "casos_covid_confirmados") {
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

      if(this.summary.confirmados == null)
      {
        this.summary.confirmados = "0"
      }

      if (this.summary.obitos == null){
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
        else{
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
      height: '90%'
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }

  handleRestrictedArea() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.width = '40%';
    dialogConfig.id = "modal-restricted-area-access";

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
              } else if (type.source == 'external'){
                type.urlLegend = type.legendUrl
              }
              else{
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
  }
}