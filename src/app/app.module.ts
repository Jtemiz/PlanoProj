import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';


// Pages
import {ChartComponent} from './sites/chart/chart.component';
import {DashboardComponent} from './sites/Dashboard/dashboard.component';
import {DatenbestandComponent} from './sites/datenbestand/datenbestand.component';
import {SettingsComponent} from './sites/settings/settings.component';
import {ConfigComponent} from './config/config.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
const config: SocketIoConfig = { url: 'http://localhost:5000', options: {} };
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
  },
  {
    path: 'config', component: ConfigComponent
  }
];
@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    DashboardComponent,
    DatenbestandComponent,
    SettingsComponent,
    ConfigComponent
    ],
  imports: [
    FlexLayoutModule,
    SocketIoModule.forRoot(config),
    BrowserModule,
    HttpClientModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
