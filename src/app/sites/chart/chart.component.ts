import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {interval, Observable, Subscription} from 'rxjs';
import {ConfigComponent} from '../../config/config.component';
import {DBHandlerApiService} from '../../services/db-handler-api.service';
import {DarkModeComponent} from '../../services/dark-mode/dark-mode.component';
import {DarkModeService} from 'angular-dark-mode';

@Component({
  selector: 'app-basic-update',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})


export class ChartComponent implements OnInit, OnDestroy {
  runningMeasuring = true;
  subscription: Subscription;
  options: any;
  updateOptions: any;
  dbHandler: DBHandlerApiService;
  private oneDay = 24 * 3600 * 1000;
  private now: Date;
  private value: number;
  private data: any[];
  private timer: any;
  private config: ConfigComponent;
  public values: number[];
  public comments: string[] = ['Tagesnaht', 'Verschmutzte Fahrbahn', 'Kurve', 'Bodenwelle'];
  public choosedComment: string = this.comments[0];
  public choosedPosition: number;
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
  constructor(dbHandler: DBHandlerApiService, private darkModeService: DarkModeService) {}
  ngOnInit(): void {

    /**
     * periodical run of getValues()-method
     * Parameter period = interval of running method getValues()
     */
    const source = interval(2000000);
    this.subscription = source.subscribe(val => { if (this.runningMeasuring == true) {
      this.getValues();
      console.log('Measuring running');
    } });
    // generate some random testing data:

    this.data = [];
    this.values = [];
    this.now = new Date(1997, 9, 3);
    this.value = Math.random() * 1000;
    // this.data.push(this.dbHandler.getValues(0));

    // initialize chart options:
    this.options = {
      title: {
        text: 'Messwerte'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          params = params[0];
          const date = new Date(params.name);
          return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
        },
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
        type: 'value',
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
          show: false
        }
      },
      series: [{
        name: 'Mocking Data',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: this.data
      }]
    };

    // Mock dynamic data:
    this.timer = setInterval(() => {
      if (this.runningMeasuring){
        for (let i = 0; i < 5; i++) {
          this.data.shift();
          this.data.push(this.getValues());
      }
      }

      // update series data:
      this.updateOptions = {
        series: [{
          data: this.data
        }]
      };
    }, 1000);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    clearInterval(this.timer);
  }

  getValues() {
    this.dbHandler.getNewValues().subscribe(data => {
        console.log(data);
        return data;
    },
      error => {
      console.log(error);
      });
  }

  startMeasuring() {
    if (!this.runningMeasuring) {
      this.dbHandler.createTable();
      this.runningMeasuring = true;
      // this.data = [];
      // this.values = [];
    }
  }
  setComment(str: string, at: number) {
  this.dbHandler.setComment(str, at);
  }
  stopMeasuring() {
    this.runningMeasuring = false;
  }

  /**
   * @TODO implement pauseMeasuringMethode
   */
  pauseMeasuring() {
    return null;
  }
/*
  randomData() {
    this.now = new Date(this.now.getTime() + this.oneDay);
    this.value = this.value + Math.random() * 30 - 10;
    return {
      name: this.now.toString(),
      value: [
        [this.now.getFullYear(), this.now.getMonth() + 1, this.now.getDate()].join('/'),
        Math.round(this.value)
      ]
    };
  }
 */

}
