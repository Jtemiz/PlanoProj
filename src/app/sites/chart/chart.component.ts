import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ConfigComponent} from '../../config/config.component';
import {DBHandlerApiService} from '../../services/db-handler-api.service';
import {DarkModeService} from 'angular-dark-mode';
import {Title} from '@angular/platform-browser';
import {AlertService} from '../../services/_alert';
import {Messwert} from '../../Messwert';


@Component({
  selector: 'app-basic-update',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})

export class ChartComponent implements OnInit, OnDestroy {

  constructor(private dbHandler: DBHandlerApiService, private darkModeService: DarkModeService, private titleService: Title, public alert: AlertService) {
    this.titleService.setTitle('APS - Messung');
  }

  runningMeasuring = (localStorage.getItem('MeasurementActive') === 'true');
  pausedMeasuring: boolean = (localStorage.getItem('PauseActive') === 'true');
  currentSpeed = 0;
  options: any;
  updateOptions: any;
  // x-Axis
  private data: any[];
  private timer: any;
  private config: ConfigComponent;
  public comments: [] = JSON.parse(localStorage.getItem('comments'))
  public choosedComment;
  public choosedPosition = 10;
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
  public isCollapsed = true;

  ngOnInit(): void {

    //if (this.runningMeasuring) {
    //  this.data = JSON.parse(localStorage.getItem('CurrentMeasurementValues'));
    // }
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
    }, 10000);
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
    this.dbHandler.createTable();
    this.dbHandler.startArduino();
    this.data = [];
  }

  stopMeasuring() {
    this.pausedMeasuring = false;
    localStorage.setItem('PauseActive', 'false');
    this.runningMeasuring = false;
    localStorage.setItem('MeasurementActive', 'false');
    this.dbHandler.stopArduino('Place', 12.518, 'Joel Temiz');
    console.log('Messung gestoppt');
  }

  setComment(str: string, at: number) {
    this.dbHandler.setComment(str, at).subscribe(data => {
        console.log(data);
        this.storeCommentInLocalStorage(str);
        this.choosedComment = '';
      },
      err => {
        console.log(err);
        return this.alert.error('Fehler in der Datenbank-Verbindung: Kommentar konnte nicht hinzugefügt werden.');
      });
  }

  changePauseMeasuring() {
    if (!this.pausedMeasuring) {
      this.pauseMeasuring();
    } else if (this.pausedMeasuring) {
      this.continueMeasuring();
    }
  }

  pauseMeasuring() {
    this.pausedMeasuring = true;
    localStorage.setItem('PauseActive', 'true');
    //  this.dbHandler.stopArduino();
    console.log('Messung pausiert');
  }

  continueMeasuring() {
    this.pausedMeasuring = false;
    localStorage.setItem('PauseActive', 'false');
    this.dbHandler.startArduino();
    console.log('Messung fortgesetzt');
  }

  storeCommentInLocalStorage(value) {
    const entry = {
      comment: value
    };
    let existingEntries = JSON.parse(localStorage.getItem('comments'));
    if (existingEntries == null) {
      existingEntries = [];
      localStorage.setItem('comments', JSON.stringify(entry));
    } else {
      for (let i = 0; i < existingEntries.length; i++) {
        if (existingEntries[i].comment == value) {
          return;
        }
      }
    }
    existingEntries.push(entry);
    localStorage.setItem('comments', JSON.stringify(existingEntries));
    this.comments = JSON.parse(localStorage.getItem('comments'));
  }
}

