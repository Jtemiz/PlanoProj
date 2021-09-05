import { Component } from '@angular/core';
import {DarkModeService} from 'angular-dark-mode';
import {Observable} from 'rxjs';
import {DBHandlerApiService} from '../../services/db-handler-api.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  title = 'Settings';
  constructor(private darkModeService: DarkModeService, private dbHandlerApiService: DBHandlerApiService, private titleService: Title) {
    this.titleService.setTitle('APS - Einstellungen');
  }
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
  public isCollapsed = true;

  updateRpi(){
    this.dbHandlerApiService.startUpdate();
  }
}
