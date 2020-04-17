import {Component, Inject, Input, Optional, OnInit, HostListener} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  innerHeigth:number;
  controls:any

  constructor(
      public dialogRef: MatDialogRef<HelpComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.innerHeigth = window.innerHeight  - 280;
    this.controls = data.controls;
  }

  ngOnInit() {
  }

  closeDialog(){
    this.dialogRef.close({event:'close'});
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerHeigth = window.innerHeight - 280;
  }



}
