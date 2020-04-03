import {Component, EventEmitter, Inject, Input, Optional, OnInit, Output} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-restricted-area-access',
  templateUrl: './restricted-area-access.component.html',
  styleUrls: ['./restricted-area-access.component.css']
})
export class RestrictedAreaAccessComponent implements OnInit {

  @Output() requireAccess = new EventEmitter();

  @Input() codigoautorizacao:any;

  errorCodigoautorizacao:boolean;

  constructor(
      public dialogRef: MatDialogRef<RestrictedAreaAccessComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.codigoautorizacao     = '';

    this.errorCodigoautorizacao  = false;
  }

  ngOnInit() {
  }

  closeDialog(){
    this.dialogRef.close({event:'close'});
  }

  onRequireAccess(){
    this.requireAccess.emit();
  }

  onSubmit(){
    if(this.codigoautorizacao == '' || this.codigoautorizacao == null){
      console.log("Campos vazios");
      this.errorCodigoautorizacao = true;
    }else{
      this.errorCodigoautorizacao = false;
      console.log("Todos dados preenchidos");
    }
  }

}
