import {Component, Inject, Optional, OnInit, HostListener} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-projections',
  templateUrl: './projections.component.html',
  styleUrls: ['./projections.component.css']
})
export class ProjectionsComponent implements OnInit {
  innerHeigth:number;
  source:any;
  httpOptions:any;
  constructor(
      public dialogRef: MatDialogRef<ProjectionsComponent>,
      @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
      private http: HttpClient
  ) {
    this.innerHeigth = window.innerHeight  - 200;
    this.httpOptions = {
      headers: new HttpHeaders(
          {
            'Content-Type': 'text/html',
            'changeOrigin':  'true'
          }
      )
    };
    this.source = null;
  }

  ngOnInit() {
    this.getSource();
  }

  async getSource(){
    let response: any ;
    let page = '';

    response = await this.http.get('/service/indicators/covidBio').toPromise()

    page = response.page;
    page = page.replace(' <title>Modelagem da expansão espaço-temporal da COVID-19 em Goiás</title>', '')
    page = page.replace('href="CovidGON', 'target="_blank" href="http://covid.bio.br/CovidGON')
    page = page.replace('href="CovidGON', 'target="_blank" href="http://covid.bio.br/CovidGON')
    page = page.replace('href="CovidGON', 'target="_blank" href="http://covid.bio.br/CovidGON')
    page = page.replace('href="CovidGON', 'target="_blank" href="http://covid.bio.br/CovidGON')
    page = page.replace('href="CovidGON', 'target="_blank" href="http://covid.bio.br/CovidGON')
    page = page.replace('href="CovidGON', 'target="_blank" href="http://covid.bio.br/CovidGON')
    page = page.replace('href="favicon.png"', 'href="http://covid.bio.br/favicon.png"')
    page = page.replace('src="LogoSmall.png"', 'src="http://covid.bio.br/LogoSmall.png"')
    page = page.replace('src="zoom.png"', 'onerror="this.onerror=this.src=\'http://covid.bio.br/IconTW.png\';" src="http://covid.bio.br/zoom.png"')
    page = page.replace('src="zoom.png"', 'onerror="this.onerror=this.src=\'http://covid.bio.br/IconTW.png\';" src="http://covid.bio.br/zoom.png"')
    page = page.replace('src="zoom.png"', 'onerror="this.onerror=this.src=\'http://covid.bio.br/IconTW.png\';" src="http://covid.bio.br/zoom.png"')
    page = page.replace('src="IconTW.png"', 'src="http://covid.bio.br/IconTW.png"')
    page = page.replace('src="IconWA.png"', 'src="http://covid.bio.br/IconWA.png"')
    page = page.replace('src="IconFB.png', 'src="http://covid.bio.br/IconFB.png"')
    this.source = page;

  }

  closeDialog(){
    this.dialogRef.close({event:'close'});
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerHeigth = window.innerHeight - 200;
  }

}
