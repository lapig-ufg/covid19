import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router, NavigationEnd } from '@angular/router';
import { MapComponent } from './views/map.component';
import { MapMobileComponent } from './views/map-mobile/map-mobile.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

declare let gtag: Function;

const routes: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'mobile', component: MapMobileComponent },
  { path: '', redirectTo: '/map', pathMatch: 'full' }
];

const routesMobile: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'mobile', component: MapMobileComponent },
  { path: '', redirectTo: '/mobile', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})

export class AppRoutingModule {

  constructor(public router: Router){

    if (window.innerWidth < 768) {
      router.resetConfig(routesMobile);
    }

    this.router.events.subscribe(event => {
        if(event instanceof NavigationEnd){
          gtag('config', 'UA-162032490-1',
              {
                'page_path': event.urlAfterRedirects
              }
          );
        }
      }
    )
  }

 }
