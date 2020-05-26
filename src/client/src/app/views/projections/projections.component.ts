import {Component, Inject, Optional, OnInit, HostListener} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-projections',
  templateUrl: './projections.component.html',
  styleUrls: ['./projections.component.css']
})
export class ProjectionsComponent implements OnInit {
  innerHeigth:number;
  constructor(
      public dialogRef: MatDialogRef<ProjectionsComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.innerHeigth = window.innerHeight  - 180;
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
