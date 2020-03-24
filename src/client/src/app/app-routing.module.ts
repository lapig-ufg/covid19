import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { MapComponent } from './views/map.component';
import { MapMobileComponent } from './views/map-mobile/map-mobile.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';


const routes: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'mobile', component: MapMobileComponent },
  { path: '', redirectTo: '/map', pathMatch: 'full' }
]

const routesMobile: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'mobile', component: MapMobileComponent },
  { path: '', redirectTo: '/mobile', pathMatch: 'full' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {
  public constructor(private router: Router) {

    console.log(window.innerWidth)
    if (window.innerWidth < 768) {
      router.resetConfig(routesMobile);
    }

  }
 }
