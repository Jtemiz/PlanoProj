import {Component, OnInit} from '@angular/core';
import {DBHandlerApiService} from '../../services/db-handler-api.service';
import {DarkModeService} from 'angular-dark-mode';
import {Observable} from 'rxjs';
import {Messwert} from '../../Messwert';
@Component({
  selector: 'app-root',
  templateUrl: './datenbestand.component.html',
  styleUrls: ['./datenbestand.component.css']
})
export class DatenbestandComponent {
  title = 'Datenbestand';
  dbHandler: DBHandlerApiService;
  tables: string[] = [
    "table1", "table2", "table3", "Table4", "table5"
  ];
  selectedTableValues: Messwert[];
  constructor(dbHandler: DBHandlerApiService, private darkModeService: DarkModeService) {};
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;

  getExistingTables() {
      this.dbHandler.getAllTables().subscribe(data => {
        console.log(data[0]);
        this.tables = data;
        return data;
      },
      error => {
        console.log(error);
      });
  }

  openTable(tableName: string) {
    this.dbHandler.getTable(tableName).subscribe(data => {
      this.selectedTableValues = data;
      console.log(data);
      return data;
    },
      error => {
        console.log(error);
      });
  }
}
