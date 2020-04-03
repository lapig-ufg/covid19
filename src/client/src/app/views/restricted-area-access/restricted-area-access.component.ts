import {Component, EventEmitter, Inject, Input, Optional, OnInit, Output} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-restricted-area-access',
  templateUrl: './restricted-area-access.component.html',
  styleUrls: ['./restricted-area-access.component.css']
})
export class RestrictedAreaAccessComponent implements OnInit {

  @Output() requireAccess = new EventEmitter();

  constructor(
      public dialogRef: MatDialogRef<RestrictedAreaAccessComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  closeDialog(){
    this.dialogRef.close({event:'close'});
  }

  onRequireAccess(){
    this.requireAccess.emit();
  }

}
