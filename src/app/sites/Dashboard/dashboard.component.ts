import {Component, OnInit, ViewChild} from '@angular/core';
import {DarkModeService} from 'angular-dark-mode';
import {Observable} from 'rxjs';
import {NgbCarouselConfig} from '@ng-bootstrap/ng-bootstrap';
import {Title} from '@angular/platform-browser';
import {AlertService} from '../../services/_alert';
import {Subscription} from 'rxjs/dist/types';
import {KtdGridLayout, KtdGridLayoutItem, ktdTrackById} from '@katoid/angular-grid-layout';

@Component({
  selector: 'app-root',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  title = 'Dashboard';

  constructor(private darkModeService: DarkModeService, carouselConfig: NgbCarouselConfig, private titleService: Title, public alert: AlertService) {
    this.titleService.setTitle('APS - Startseite');
  }


  possibleGridItems: KtdGridLayout = [
    {id: 'chart', x: 0, y: 0, w: 6, h: 8},
    {id: 'data', x: 7, y: 0, w: 5, h: 3},
    {id: 'settings', x: 7, y: 7, w: 5, h: 3},
  ];
  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;
  public isCollapsedChart = false;
  public isCollapsedData = false;
  public isCollapsedSettings = false;

  cols = 12;
  rowHeight = 100;
  layout: KtdGridLayout = [];

  ngOnInit(): void {
    this.onLayoutUpdated(this.possibleGridItems);
  }

  onLayoutUpdated(layout: KtdGridLayout) {
    console.log('on layout updated', layout);
    this.layout = layout;
  }

  rebuildGrid() {
    this.onLayoutUpdated(this.possibleGridItems);
  }

  addItemToLayout1() {
    const maxId = this.layout.reduce((acc, cur) => Math.max(acc, parseInt(cur.id, 10)), -1);
    const nextId = maxId + 1;

    const newLayoutItem: KtdGridLayoutItem = {
      id: nextId.toString(),
      x: 0,
      y: 0,
      w: 2,
      h: 2
    };

    // Important: Don't mutate the array, create new instance. This way notifies the Grid component that the layout has changed.
    this.layout = [
      ,
      ...this.layout
    ];
  }

  /** Removes the item from the layout */
  removeItem(id: string) {
    // Important: Don't mutate the array. Let Angular know that the layout has changed creating a new reference.
    this.ktdArrayRemoveItem(this.layout, (item) => item.id === id);
  }

  ktdArrayRemoveItem<T>(array: T[], condition: (item: T) => boolean) {
    const arrayCopy = [...array];
    const index = array.findIndex((item) => condition(item));
    if (index > -1) {
      arrayCopy.splice(index, 1);
    }
    return arrayCopy;
  }


}
