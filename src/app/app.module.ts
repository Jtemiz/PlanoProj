import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { RouterModule, Routes } from '@angular/router';
// Pages
import {ChartComponent} from './sites/chart/chart.component';
import {DashboardComponent} from './sites/Dashboard/dashboard.component';
import {DatenbestandComponent} from './sites/datenbestand/datenbestand.component';
import {SettingsComponent} from './sites/settings/settings.component';

const appRoutes: Routes = [
  {
    path: 'chart', component: ChartComponent,
  },
  {
    path: '', component: DashboardComponent
  },
  {
    path: 'settings', component: SettingsComponent
  },
  {
    path: 'data', component: DatenbestandComponent
  }
];
@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    DashboardComponent,
    DatenbestandComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
