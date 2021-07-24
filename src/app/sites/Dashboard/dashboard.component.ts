import { Component } from '@angular/core';
import {DarkModeService} from 'angular-dark-mode';
import {Observable} from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  title = 'Dashboard';
  constructor(private darkModeService: DarkModeService) {}
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
}
