import {Component, Injectable, OnInit, Inject} from '@angular/core';
import { SearchService, MapComponent } from '../map.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import{GoogleAnalyticsService} from '../../services/google-analytics.service';

import {map} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import { of } from 'rxjs/observable/of';

@Component({
  selector: 'app-map-mobile',
  templateUrl: './map-mobile.component.html',
  providers: [SearchService],
  styleUrls: ['./map-mobile.component.css']
})

export class MapMobileComponent extends MapComponent {

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogMobile, {
      width: '90%'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}

@Component({
  selector: 'dialog-fontes',
  templateUrl: 'dialog-fontes.html',
})
export class DialogMobile {

  constructor(
    public dialogRef: MatDialogRef<DialogMobile>,
    public googleAnalyticsService: GoogleAnalyticsService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  handleAnalytics(eventName, eventCategory, eventAction){
    this.googleAnalyticsService.eventEmitter(eventName, eventCategory, eventAction);
  }


}