import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DBHandlerApiService} from '../../services/db_handler/db-handler-api.service';
import {DarkModeService} from 'angular-dark-mode';
import {Observable} from 'rxjs';
import {Messwert} from '../../Messwert';
import {Metadata} from '../../Messwert';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EChartsOption} from 'echarts';
import {faEye} from '@fortawesome/free-regular-svg-icons';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {Title} from '@angular/platform-browser';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{name}}</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
    </div>
    <div echarts class="demo-chart" [options]="chartOptions"></div>

  `
})
export class NgbdModalContent implements OnInit, OnDestroy {
  @Input() name;

  constructor(public activeModal: NgbActiveModal, private DBHandler: DBHandlerApiService) {
  }

  data: any[] = [];
  chartOptions: EChartsOption;

  ngOnInit() {
    this.chartOptions = {
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: this.data,
          type: 'line',
        },
      ],
    };

    this.DBHandler.getTable(this.name).subscribe(data => {
        const tmp = JSON.parse(data.data);
        for (let i = 0; i < tmp.length; i++) {
          this.data.push({
            name: tmp[i].position + ': ' + tmp[i].height, value: [tmp[i].position, tmp[i].height]
          });
        }
      }
    );
  }

  ngOnDestroy() {
    this.data = [];
  }

}


@Component({
  selector: 'dataComp',
  templateUrl: './datenbestand.component.html',
  styleUrls: ['./datenbestand.component.css']
})
export class DatenbestandComponent implements OnInit {

  constructor(private dbHandler: DBHandlerApiService, private darkModeService: DarkModeService, private modalService: NgbModal, private library: FaIconLibrary, private titleService: Title) {
    library.addIcons(faEye);
    this.titleService.setTitle('APS - Datenbestand');
  }

  title = 'Datenbestand';
  tables: any[] = [];
  selectedTableValues: Messwert[];

  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;

  ngOnInit(): void {
    this.getExistingTables();
  }

  getExistingTables() {
    return this.dbHandler.getAllTables().subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          this.tables.push({
            measurement: data[i][0], place: data[i][1], distance: 12, user: data[i][2]
          });
        }
      }, err => {
        console.log(err);
        this.tables.push({
          measurement: '1', place: '2', distance: 12, user: '3'
        });
      }
    );
  }

  openTable(tableName: string) {
    return this.dbHandler.getTable(tableName).subscribe(data => {
        this.selectedTableValues = data;
        console.log(data);
        return data;
      },
      error => {
        console.log(error);
      });
  }

  open(tableName: string) {
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.name = tableName;
  }
}
