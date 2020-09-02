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
  index:number;

  constructor(
      public dialogRef: MatDialogRef<DialogChartsComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.index = 0;
    if(data.hasOwnProperty('index')){
      this.index = data.index
    }
    this.innerHeigth = window.innerHeight - 180;
    this.type        = this.data.dados.timeseries.chartResult[this.index].type;
    this.title       = this.data.dados.timeseries.chartResult[this.index].text;
    this.dataChart   = this.data.dados.timeseries.chartResult[this.index].dataResult;
    this.options     = this.data.dados.timeseries.chartResult[this.index].options
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
