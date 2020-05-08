import {Component, Inject, Input, Optional, OnInit, HostListener} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-beds',
  templateUrl: './beds.component.html',
  styleUrls: ['./beds.component.css']
})
export class BedsComponent implements OnInit {
  innerHeigth:number;
  controls:any

  constructor(
      public dialogRef: MatDialogRef<BedsComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.innerHeigth = window.innerHeight  - 180;
    this.controls = data.controls;
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
