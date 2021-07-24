import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {DarkModeService} from 'angular-dark-mode';

@Component({
  selector: 'app-dark-mode',
  template: '<label class="switch">\n' +
    '  <input\n' +
    '    type="checkbox"\n' +
    '    [checked]="darkMode$ | async"\n' +
    '    (change)="onToggle()"\n' +
    '    class="toggle"\n' +
    '  />  <span class="slider round"></span>\n' +
    '</label>',
  styleUrls: ['./dark-mode.component.css']
})
export class DarkModeComponent {

  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
  constructor(private darkModeService: DarkModeService) {}

  onToggle(): void {
    this.darkModeService.toggle();
  }
}

