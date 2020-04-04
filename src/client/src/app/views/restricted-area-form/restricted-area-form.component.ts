import {Component, EventEmitter, Inject, Input, Optional, OnInit, Output} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-restricted-area-form',
  templateUrl: './restricted-area-form.component.html',
  styleUrls: ['./restricted-area-form.component.css']
})
export class RestrictedAreaFormComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<RestrictedAreaFormComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  closeDialog(){
    this.dialogRef.close({event:'close'});
  }

}
