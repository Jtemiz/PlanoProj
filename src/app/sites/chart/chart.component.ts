import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {interval, Observable, Subscription} from 'rxjs';
import {ConfigComponent} from '../../config/config.component';
import {DBHandlerApiService} from '../../services/db-handler-api.service';
import {DarkModeService} from 'angular-dark-mode';
import {Messwert} from '../../Messwert';

@Component({
  selector: 'app-basic-update',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})


export class ChartComponent implements OnInit, OnDestroy {
  static runningMeasuring: boolean;
  subscription: Subscription;
  options: any;
  updateOptions: any;
  // y-Axis
  private value: number[];
  // x-Axis
  private data: number[];


  private timer: any;
  private config: ConfigComponent;
  public values: number[];
  public comments: string[] = ['Tagesnaht', 'Verschmutzte Fahrbahn', 'Kurve', 'Bodenwelle'];
  public choosedComment = 'Kommentar hinzufügen';
  public choosedPosition: number;
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;

  constructor(private dbHandler: DBHandlerApiService, private darkModeService: DarkModeService) {
    ChartComponent.runningMeasuring = dbHandler.isMActive();
  }

  ngOnInit(): void {
    /**
     * periodical run of getValues()-method
     * Parameter period = interval of running method getValues()
     */

    /*
    const source = interval(2000000);
    this.subscription = source.subscribe(val => { if (this.runningMeasuring == true) {
      this.getValues();
      console.log('Measuring running');
    } });
     */
    // initialize chart options:
    this.options = {
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
      if (ChartComponent.runningMeasuring) {
      return this.getValues().forEach(
          function(mw) {
            this.data.push(mw.position);
            this.value.push(mw.height);
          }
        );
      }

      // update series data:
      this.updateOptions = {
        series: [{
          data: this.data,
          value: this.values
        }]
      };
    }, 1000);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    clearInterval(this.timer);
  }


  getValues(): Messwert[] {
    return this.dbHandler.getNewValues().subscribe(data => {
      //console.log(data);
      let mws = [];
      data.forEach(function(str) {
        if (str.substr(0, 2) == 'MES') {
          mws.push(this.valueParser(str.substr(4)));
        }
      });
      console.log(mws);
      return mws;
    });
  }

  valueParser(valStr): Messwert {
    const mw: Messwert = new Messwert(Number(valStr.substr(4, valStr.lastIndexOf('/'))),
      Number(valStr.substr(valStr.lastIndexOf('/') + 1, valStr.lastIndexOf('$'))));
    console.log("valueParser: " + mw);
    return mw;
  }

  changeRunningMeasuring() {
    if (!ChartComponent.runningMeasuring) {
      this.startMeasuring();
      return;
    } else {
      this.stopMeasuring();
    }
  }

  startMeasuring() {
    this.dbHandler.createTable();
    ChartComponent.runningMeasuring = true;
    this.data = [];
    this.values = [];
  }

  setComment(str: string, at: number) {
    this.dbHandler.setComment(str, at);
  }

  stopMeasuring() {
    ChartComponent.runningMeasuring = false;
    this.dbHandler.stopArduino();
    console.log('Messung gestoppt');
  }

  /**
   * @TODO implement pauseMeasuringMethode
   */
  pauseMeasuring() {
    return null;
  }

  get staticUrlMeasuring() {
    return ChartComponent.runningMeasuring;
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

