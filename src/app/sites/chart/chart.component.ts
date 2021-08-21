import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ConfigComponent} from '../../config/config.component';
import {DBHandlerApiService} from '../../services/db-handler-api.service';
import {DarkModeService} from 'angular-dark-mode';


export interface Messwert {
  type: string;
  position: number;
  height: number;
}

@Component({
  selector: 'app-basic-update',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})

export class ChartComponent implements OnInit, OnDestroy {

  constructor(private dbHandler: DBHandlerApiService, private darkModeService: DarkModeService) {

  }

  runningMeasuring: boolean = (localStorage.getItem('MeasurementActive') === 'true');
  pausedMeasuring: boolean = (localStorage.getItem('PauseActive') === 'true');
  currentSpeed = 0;
  options: any;
  updateOptions: any;
  // x-Axis
  private data: any[];
  private timer: any;
  private config: ConfigComponent;
  public comments: string[] = ['Tagesnaht', 'Verschmutzte Fahrbahn', 'Kurve', 'Bodenwelle'];
  public choosedComment = 'Kommentar hinzufügen';
  public choosedPosition: number;
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;

  ngOnInit(): void {
    if (this.runningMeasuring) {
      this.data = JSON.parse(localStorage.getItem('CurrentMeasurementValues'));
    }
    // initialize chart options:
    this.options = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          params = params[0];
          return params.name;
        },
        axisPointer: {
          animation: false,
        }
      },
      dataZoom: [{
        type: 'inside',
        throttle: 5,
        orient: 'horizontal',
        zoomOnMouseWheel: true,
        moveOnMouseMove: true
      }],
      xAxis: {
        type: 'value',
        splitLine: {
          show: false
        },
        axisPointer: {
          handle: {
            show: true,
            color: 'rgb(35, 109, 198)'
          }
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
          show: true
        }
      },
      series: [{
        name: 'Mocking Data',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: this.data,

      }]
    };

    // Mock dynamic data:
    this.timer = setInterval(() => {
      if (this.runningMeasuring && !this.pausedMeasuring) {
        this.getValues();
        this.currentSpeed = Math.floor(Math.random() * (180 + 1));
      }

      // update series data:
      this.updateOptions = {
        series: [{
          data: this.data,
        }]
      };
    }, 500);
  }

  ngOnDestroy() {
    if (this.runningMeasuring) {
      const dataToSave = JSON.stringify(this.data);
      localStorage.setItem('CurrentMeasurementValues', dataToSave);
    } else {
      clearInterval(this.timer);
      localStorage.removeItem('CurrentMeasurementValues');
    }
  }


  getValues(): Messwert[] {
    return this.dbHandler.getNewValues().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.data.push({
          name: data[i].position + ': ' + data[i].height, value: [data[i].position, data[i].height]
        });
      }
    });
  }

  changeRunningMeasuring() {
    if (!this.runningMeasuring) {
      this.startMeasuring();
      return;
    } else {
      this.stopMeasuring();
    }
  }

  startMeasuring() {
    this.runningMeasuring = true;
    localStorage.setItem('MeasurementActive', 'true');
    this.dbHandler.startArduino();
    this.dbHandler.createTable();
    this.data = [];
  }


  setComment(str: string, at: number) {
    this.dbHandler.setComment(str, at);
  }

  stopMeasuring() {
    this.pausedMeasuring = false;
    localStorage.setItem('PauseActive', 'false');
    this.runningMeasuring = false;
    localStorage.setItem('MeasurementActive', 'false');
    this.dbHandler.stopArduino();
    console.log('Messung gestoppt');
  }

  changePauseMeasuring() {
    if (!this.pausedMeasuring) {
      this.pauseMeasuring();
    }
    else if (this.pausedMeasuring) {
      this.continueMeasuring();
    }
  }
  pauseMeasuring() {
    this.pausedMeasuring = true;
    localStorage.setItem('PauseActive', 'true');
    this.dbHandler.stopArduino();
    console.log('Messung pausiert');
  }
  continueMeasuring() {
    this.pausedMeasuring = false;
    localStorage.setItem('PauseActive', 'false');
    this.dbHandler.startArduino();
    console.log('Messung fortgesetzt');
  }
}

