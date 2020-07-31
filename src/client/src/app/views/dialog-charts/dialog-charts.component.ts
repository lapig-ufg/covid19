import {Component, Inject, Input, Optional, OnInit, HostListener} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog-charts',
  templateUrl: './dialog-charts.component.html',
  styleUrls: ['./dialog-charts.component.css']
})
export class DialogChartsComponent implements OnInit {

  title:any;
  type:any;
  dataChart:any;
  options:any;
  innerHeigth:number;

  constructor(
      public dialogRef: MatDialogRef<DialogChartsComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log("Dialog: ", this.data)
    this.innerHeigth = window.innerHeight - 180;
    this.type        =  this.data.timeseries.chartResult[0].type;
    this.title       = this.data.timeseries.chartResult[0].text;
    this.dataChart   = this.data.timeseries.chartResult[0].dataResult;
    this.options     = this.data.timeseries.chartResult[0].options
  }

  ngOnInit() {
  }

  closeDialog(){
    this.dialogRef.close({event:'close'});
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerHeigth = window.innerHeight - 180;
  }
}
