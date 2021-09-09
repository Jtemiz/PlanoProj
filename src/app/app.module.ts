import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {AppComponent} from './app.component';
import {NgxEchartsModule} from 'ngx-echarts';
import {RouterModule, Routes} from '@angular/router';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {GaugeModule} from 'angular-gauge';
// Pages
import {ChartComponent} from './sites/chart/chart.component';
import {DashboardComponent} from './sites/Dashboard/dashboard.component';
import {DatenbestandComponent, NgbdModalContent} from './sites/datenbestand/datenbestand.component';
import {SettingsComponent} from './sites/settings/settings.component';
import {ConfigComponent} from './config/config.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {DarkModeComponent} from './services/dark-mode/dark-mode.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DARK_MODE_OPTIONS} from 'angular-dark-mode';
import {CustomErrorHandlerService} from './services/LogService/log.service';
import {ApiLoggerService} from './services/LogService/api-logger.service';
import { AlertModule } from './services/_alert';
import {FormsModule} from '@angular/forms';
import {KtdGridModule} from '@katoid/angular-grid-layout';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatGridListModule} from '@angular/material/grid-list';

const appRoutes: Routes = [
  {
    path: 'chart',
    component: ChartComponent,
    data: {
      reuse: true,
    }
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
    NgbdModalContent,
  ],
  imports: [
    NgbCollapseModule,
    GaugeModule.forRoot(),
    FontAwesomeModule,
    FlexLayoutModule,
    BrowserModule,
    HttpClientModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: false} // <-- debugging purposes only
    ),
    NgbModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    AlertModule,
    FormsModule,
    KtdGridModule,
    DragDropModule,
    MatGridListModule

  ],
  providers: [
    HttpClientModule,
    ApiLoggerService, {
      provide: ErrorHandler,
      useClass: CustomErrorHandlerService
    },
    {
      provide: DARK_MODE_OPTIONS,
      useValue: {
        element: document.body
      },
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
