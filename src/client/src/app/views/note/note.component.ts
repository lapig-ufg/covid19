import {Component, Inject, Optional, OnInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {
  note:string
  constructor(
      public dialogRef: MatDialogRef<NoteComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.note = data.note;
  }

  ngOnInit() {
  }

  closeDialog(){
    this.dialogRef.close({event:'close'});
  }
}
