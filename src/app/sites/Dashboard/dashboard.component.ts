import { Component } from '@angular/core';
import {DarkModeService} from 'angular-dark-mode';
import {Observable} from 'rxjs';
import {NgbCarouselConfig} from '@ng-bootstrap/ng-bootstrap';
import {Title} from '@angular/platform-browser';
import {AlertService} from '../../services/_alert';

@Component({
  selector: 'app-root',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  title = 'Dashboard';
  constructor(private darkModeService: DarkModeService, carouselConfig: NgbCarouselConfig, private titleService: Title, public alert: AlertService) {
    this.titleService.setTitle('APS - Startseite');
  }
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
  public isCollapsed = true;


}
