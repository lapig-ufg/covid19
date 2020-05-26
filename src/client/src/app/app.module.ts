import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from "@angular/material";

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MapComponent } from './views/map.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {ButtonModule} from 'primeng/button';
import {MatGridListModule} from '@angular/material/grid-list';


import { DropdownModule } from 'primeng/dropdown';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { LOCALE_ID } from '@angular/core';
import { MAT_LABEL_GLOBAL_OPTIONS } from '@angular/material/core';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';
import { LightboxModule } from 'ngx-lightbox';
import { NgxGalleryModule } from 'ngx-image-video-gallery';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SpinnerImgComponent } from './views/spinner-img/spinner-img.component';
import { FileUploadComponent } from './views/file-upload/file-upload.component';
import { MetadataComponent } from './views/metadata/metadata.component';
import { GoogleAnalyticsService } from  './services/google-analytics.service'
import { MatTableModule } from '@angular/material'
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MapMobileComponent, DialogMobile } from './views/map-mobile/map-mobile.component';
import { HelpComponent } from './views/help/help.component';
import { RestrictedAreaAccessComponent } from './views/restricted-area-access/restricted-area-access.component';
import { RestrictedAreaFormComponent } from './views/restricted-area-form/restricted-area-form.component';
import { NoCacheHeadersInterceptor } from './interceptors/no-cache-headers-interceptor.interceptor';
import { BedsComponent } from './views/beds/beds.component';
import { NoteComponent } from './views/note/note.component';
import { ProjectionsComponent } from './views/projections/projections.component';

registerLocaleData(localePt);

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

const ENTRY_COMPONENTS = [
  MetadataComponent,
  MapComponent,
  DialogMobile,
  HelpComponent,
  RestrictedAreaAccessComponent,
  RestrictedAreaFormComponent,
  BedsComponent,
  NoteComponent,
  ProjectionsComponent
];

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SpinnerImgComponent,
    FileUploadComponent,
    MetadataComponent,
    MapMobileComponent,
    DialogMobile,
    HelpComponent,
    RestrictedAreaAccessComponent,
    RestrictedAreaFormComponent,
    BedsComponent,
    NoteComponent,
    ProjectionsComponent,
  ],
  imports: [
    TabViewModule,
    TooltipModule,
    DropdownModule,
    NgxGalleryModule,
    FieldsetModule,
    CardModule,
    ButtonModule,
    LightboxModule,
    ScrollingModule,
    ScrollPanelModule,
    PanelModule,
    AccordionModule,
    TableModule,
    ChartModule,
    DialogModule,
    ToggleButtonModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatTabsModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatSelectModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSidenavModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatTableModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    MatGridListModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    NgxMaskModule.forRoot(options)
  ],

  entryComponents:[ENTRY_COMPONENTS],

  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: {float: 'always'} },
    DatePipe,
    GoogleAnalyticsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoCacheHeadersInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent],


})
export class AppModule {
}
