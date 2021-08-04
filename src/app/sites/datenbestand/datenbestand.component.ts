import {Component, Input, OnInit} from '@angular/core';
import {DBHandlerApiService} from '../../services/db-handler-api.service';
import {DarkModeService} from 'angular-dark-mode';
import {Observable} from 'rxjs';
import {Messwert} from '../../Messwert';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EChartsOption} from 'echarts';
import {faEye} from '@fortawesome/free-regular-svg-icons';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {LogService} from '../../services/LogService/log.service';

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
export class NgbdModalContent {
  @Input() name;

  constructor(public activeModal: NgbActiveModal) {}

  chartOptions: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
      },
    ],
  };
}




export interface Messung {
  name: string;
  ort: string;
  laenge: number;
  messer: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './datenbestand.component.html',
  styleUrls: ['./datenbestand.component.css']
})
export class DatenbestandComponent {
  title = 'Datenbestand';
  dbHandler: DBHandlerApiService;
  tables: Messung[] = [
    {
    name: 'table1', ort: 'Pfronten', laenge: 9.17, messer: 'Mustermann'
     },
    {
      name: 'table2', ort: 'Füssen', laenge: 9.17, messer: 'Mustermann'
    },
    {
      name: 'table3', ort: 'München', laenge: 9.17, messer: 'Mustermann'
    },
    {
      name: 'table4', ort: 'Hamburg', laenge: 9.17, messer: 'Mustermann'
    },
    {
      name: 'table5', ort: 'Berlin', laenge: 9.17, messer: 'Mustermann'
    },
    {
      name: 'table6', ort: 'Schwangau', laenge: 9.17, messer: 'Mustermann'
    }
  ];
  selectedTableValues: Messwert[];
  constructor(dbHandler: DBHandlerApiService, private darkModeService: DarkModeService, private modalService: NgbModal, private library: FaIconLibrary, private logger: LogService) {
    library.addIcons(faEye);
  }
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;

  getExistingTables(): Messung[] {
    this.dbHandler.getAllTables().subscribe(data => {
        this.tables = data;
        return data;
      });
    return this.tables;
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

  testLog(): void {
    this.logger.log("Test the `log()` Method", true, false, "Paul", "Smith");
  }
}
