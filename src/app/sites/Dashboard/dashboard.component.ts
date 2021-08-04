import { Component } from '@angular/core';
import {DarkModeService} from 'angular-dark-mode';
import {Observable} from 'rxjs';
import {NgbCarouselConfig} from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-root',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  title = 'Dashboard';
  constructor(private darkModeService: DarkModeService, carouselConfig: NgbCarouselConfig) {
    carouselConfig.interval = 0;
    carouselConfig.wrap = true;
    carouselConfig.keyboard = true;
    carouselConfig.pauseOnHover = false;
  }
  images = [700, 533, 807, 124].map((n) => `https://picsum.photos/id/${n}/900/500`);
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
}
