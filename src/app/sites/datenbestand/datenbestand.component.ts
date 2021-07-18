import {Component, OnInit} from '@angular/core';
import {DBHandlerApiService} from '../../services/db-handler-api.service';
@Component({
  selector: 'app-root',
  templateUrl: './datenbestand.component.html',
  styleUrls: ['./datenbestand.component.css']
})
export class DatenbestandComponent {
  title = 'Datenbestand';
  dbHandler: DBHandlerApiService;
  tables: string[];
  constructor(dbHandler: DBHandlerApiService) {};

  getExistingTables() {
      this.dbHandler.getTables().subscribe(data => {
        console.log(data);
        this.tables = data;
        return data;
      },
      error => {
        console.log(error);
      });
  }
}
