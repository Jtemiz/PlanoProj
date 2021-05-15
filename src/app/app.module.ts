import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {NgxEchartsModule} from 'ngx-echarts';
import {BasicUpdateComponent} from './chart.component';

@NgModule({
  declarations: [
    AppComponent,
    BasicUpdateComponent
  ],
  imports: [
    BrowserModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
