import {Component, Inject, Input, Optional, OnInit, HostListener} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.css']
})
export class DocsComponent implements OnInit {

  innerHeigth:number;
  src:string;

  constructor(
      public dialogRef: MatDialogRef<DocsComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.innerHeigth = window.innerHeight  - 180;
    this.src = data.src;
  }

  ngOnInit() {
  }

  closeDialog(){
    this.dialogRef.close({event:'close'});
  }

}
