import { Component } from '@angular/core';
import {DarkModeComponent} from '../../services/dark-mode/dark-mode.component';
import {DarkModeService} from 'angular-dark-mode';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  title = 'Settings';
  constructor(private darkModeService: DarkModeService) {}
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
  public isCollapsed = true;
}
