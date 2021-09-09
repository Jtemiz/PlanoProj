import { Component } from '@angular/core';
import {DarkModeService} from 'angular-dark-mode';
import {Observable} from 'rxjs';
import {DBHandlerApiService} from '../../services/db_handler/db-handler-api.service';
import { Title } from '@angular/platform-browser';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {faMinusSquare} from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'settingsComp',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  title = 'Settings';
  constructor(private darkModeService: DarkModeService, private dbHandlerApiService: DBHandlerApiService, private titleService: Title, private library: FaIconLibrary) {
    this.titleService.setTitle('APS - Einstellungen');
    library.addIcons(faMinusSquare);
  }
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
  public isCollapsedQuickCom = true;
  public isCollapsedUpdate = true;
  public comBtns = JSON.parse(localStorage.getItem('comBtn'));
  public freeComs =  JSON.parse(localStorage.getItem('comments'));
  public newComment = '';
  updateRpi(){
    this.dbHandlerApiService.startUpdate();
  }


  addQuickCommentBtn(value) {
      const entry = {
        comment: value
      };
      let existingEntries = JSON.parse(localStorage.getItem('comBtn'));
      if (existingEntries == null) {
        existingEntries = [];
        localStorage.setItem('comBtn', JSON.stringify(entry));
      } else {
        for (let i = 0; i < existingEntries.length; i++) {
          if (existingEntries[i].comment == value) {
            return;
          }
        }
      }
      existingEntries.push(entry);
      localStorage.setItem('comBtn', JSON.stringify(existingEntries));
      this.comBtns = JSON.parse(localStorage.getItem('comBtn'));
      this.newComment = '';
  }


  deleteQuickCommentBtn(value) {
    for (let i = 0; i < this.comBtns.length; i++) {
      if (this.comBtns[i].comment == value) {
        this.comBtns.splice(i, 1);
        localStorage.setItem('comBtn', JSON.stringify(this.comBtns));
        return;
      }
    }
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.comBtns, event.previousIndex, event.currentIndex);
  }

  deleteFreeComments(){
    localStorage.removeItem('comments')
}

}
