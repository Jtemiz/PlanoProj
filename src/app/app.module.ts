import {ErrorHandler, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LogPublishersService } from 'src/app/services/LogService/log-publishers.service';

// Pages
import {ChartComponent} from './sites/chart/chart.component';
import {DashboardComponent} from './sites/Dashboard/dashboard.component';
import {DatenbestandComponent, NgbdModalContent} from './sites/datenbestand/datenbestand.component';
import {SettingsComponent} from './sites/settings/settings.component';
import {ConfigComponent} from './config/config.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DarkModeComponent } from './services/dark-mode/dark-mode.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {DARK_MODE_OPTIONS} from 'angular-dark-mode';
import {LogService} from './services/LogService/log.service';
import {LogPublisher} from './services/LogService/log-publisher';
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
    ConfigComponent,
    DarkModeComponent,
    NgbdModalContent
    ],
  imports: [
    FontAwesomeModule,
    FlexLayoutModule,
    BrowserModule,
    HttpClientModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    NgbModule,
    BrowserAnimationsModule,
    FontAwesomeModule
  ],
  providers: [
    LogService,
    LogPublishersService,
    {
    provide:  DARK_MODE_OPTIONS,
    useValue: {
      element: document.body
    }
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }

