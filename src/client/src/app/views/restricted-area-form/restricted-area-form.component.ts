import {Component, EventEmitter, Inject, Input, Optional, OnInit, Output} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-restricted-area-form',
  templateUrl: './restricted-area-form.component.html',
  styleUrls: ['./restricted-area-form.component.css']
})
export class RestrictedAreaFormComponent implements OnInit {

  erroMsg:any;

  @Input() nomeresponsavel:any;
  @Input() email:any;
  @Input() telefone:any;
  @Input() orgao:any;
  @Input() cd_geocmu:any;

  errorNomeresponsavel:boolean;
  errorEmail:boolean;
  errorTelefone:boolean;
  errorOrgao:boolean;
  errorCd_geocmu:boolean;

  constructor(
      public dialogRef: MatDialogRef<RestrictedAreaFormComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.nomeresponsavel = '';
    this.email           = '';
    this.telefone        = '';
    this.orgao           = '';
    this.cd_geocmu       = '';

    this.errorNomeresponsavel  = false;
    this.errorEmail            = false;
    this.errorTelefone         = false;
    this.errorOrgao            = false;
    this.errorCd_geocmu        = false;
  }

  ngOnInit() {
  }

  closeDialog(){
    this.dialogRef.close({event:'close'});
  }

  handleErros(){
    this.errorNomeresponsavel  = this.nomeresponsavel == '' ? true : false;
    this.errorEmail            = (this.email == '' ? true : false) || (this.email.includes("@") ? false : true);
    this.errorTelefone         = this.telefone == '' ? true : false;
    this.errorOrgao            = this.orgao == '' ? true : false;
    this.errorCd_geocmu        = this.cd_geocmu == '' ? true : false;

    return (this.errorNomeresponsavel == false && this.errorEmail == false && this.errorTelefone == false && this.errorOrgao == false && this.errorCd_geocmu == false);
  }

  onSubmit(){
    if(this.handleErros()){
      console.log("Todos dados preenchidos");
    }else{
      console.log("Campos vazios");
    }

  }

}
