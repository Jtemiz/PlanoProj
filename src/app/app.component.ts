import { Component } from '@angular/core';
import {DarkModeService} from 'angular-dark-mode';
import {Observable} from 'rxjs/dist/types';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'PlanoProj';

  constructor(public darkModeService: DarkModeService) {
  }

// Get the button that opens the modal
   btn = document.getElementById('1');

// Get the <span> element that closes the modal
   span = document.getElementsByClassName('close')[0];

  alertOptions = {
    autoClose: false,
    keepAfterRouteChange: false
  };

  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
  public isCollapsed = true;


}

