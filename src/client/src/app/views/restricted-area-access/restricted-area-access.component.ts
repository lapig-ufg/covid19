import {Component, EventEmitter, Inject, Input, Optional, OnInit, Output} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-restricted-area-access',
  templateUrl: './restricted-area-access.component.html',
  styleUrls: ['./restricted-area-access.component.css']
})
export class RestrictedAreaAccessComponent implements OnInit {

  @Output() requireAccess = new EventEmitter();
  @Output() userEvent     = new EventEmitter();

  @Input() codigoautorizacao:any;

  httpOptions:any;
  user:any;
  msg:any;
  display:boolean;
  lang:any;

  lables:any;

  errorCodigoautorizacao:boolean;

  constructor(
      public dialogRef: MatDialogRef<RestrictedAreaAccessComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
      private http: HttpClient
  ) {

    this.lang = data.lang;
    this.codigoautorizacao = '';
    this.display = false;

    this.errorCodigoautorizacao  = false;
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    this.lables = {};
    this.updateLables();

  }

  ngOnInit() {
  }

  closeDialog(){
    this.dialogRef.close({event:'close'});
  }

  onRequireAccess(){
    this.requireAccess.emit();
  }

  private updateLables() {
    let sourceUrl = '/service/restrictedAccess/lablesAccess' + this.getServiceParams();
    this.http.get(sourceUrl).subscribe(result => {
      this.lables = result;
    });
  }

  private getServiceParams() {
    let params = [];

    params.push('lang=' + this.lang);

    let urlParams = '?' + params.join('&');

    return urlParams;
  }


  onSubmit(){
    if(this.codigoautorizacao == '' || this.codigoautorizacao == null){
      this.errorCodigoautorizacao = true;
    }else{

      this.errorCodigoautorizacao = false;

      let dados = {
        codigoautorizacao : this.codigoautorizacao
      };

      this.http.post('/service/restrictedAccess/access', JSON.stringify(dados), this.httpOptions).subscribe(result => {
        this.user = result;

        if(this.user.length <= 0){
          this.display = true;
          this.msg = this.lables.error_msg_unidentified;
        }else{
          this.userEvent.emit(result[0]);
        }

      },(err) => {
        this.display = true;
        this.msg = this.lables.error_msg_acces;
      });
    }
  }

}
