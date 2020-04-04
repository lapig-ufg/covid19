import {Component, EventEmitter, Inject, Input, Optional, OnInit, Output} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-restricted-area-form',
  templateUrl: './restricted-area-form.component.html',
  styleUrls: ['./restricted-area-form.component.css']
})
export class RestrictedAreaFormComponent implements OnInit {

  erroMsg:any;

  countiesControl = new FormControl();
  filteredOptions: Observable<string[]>;

  // Headers
  httpOptions:any;

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

  counties:any = [];

  constructor(
      public dialogRef: MatDialogRef<RestrictedAreaFormComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
      private http: HttpClient
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

    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
  }

  ngOnInit() {
    this.getCounties();

    this.filteredOptions = this.countiesControl.valueChanges
        .pipe(
            startWith(''),
            map(value => this._filter(value))
        );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.counties.filter(option => option.label.toLowerCase().includes(filterValue));
  }

  closeDialog(){
    this.dialogRef.close({event:'close'});
  }

  getCounties(){
    this.http.get('/service/restrictedAccess/counties',).subscribe(result => {
      this.counties = result;
    });
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
      let county = this.cd_geocmu.split('-');

      let dados = {
        nomeresponsavel : this.nomeresponsavel,
        email : this.email,
        telefone : this.telefone,
        orgao : this.orgao,
        cd_geocmu : county[0].trim()
      };

      this.http.post('/service/restrictedAccess/access', JSON.stringify(dados), this.httpOptions).subscribe(result => {
        this.erroMsg = false;
      },(err) => {
            this.erroMsg = err;
      });

    }
  }

}
