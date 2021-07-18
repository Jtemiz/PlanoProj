import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Messwert} from '../Messwert';


@Injectable({
  providedIn: 'root'
})

export class DBHandlerApiService {
  constructor(private http: HttpClient) { }
  public messwert: Messwert[];
  private apiURL = 'http://localhost:5000/';
  private ardURL = 'http://192.168.178.170/';

  setComment(str: string, at: number): void {
    this.http.put<any>(this.apiURL, {kommentar: str, position: at})
      .subscribe(data => console.log(data));
  }

  createTable() {
    const date = new Date(Date.now());
    const tabN = date.getFullYear()
      + ('0' + (date.getMonth() + 1)).slice(-2)
      + ('0' + date.getDate()).slice(-2)
      + ('0' + date.getHours()).slice(-2)
      + ('0' + date.getMinutes()).slice(-2);
    this.http.put<any>(this.apiURL + 'management', {tableName: tabN} ).subscribe(data => console.log("created new table: " + tabN + "; Return Value = " + data))
    this.startArduino(tabN)
  }

  startArduino(tabN: string) {
    this.http.put<any>(this.ardURL, {tableName: tabN} ).subscribe(data => console.log('Arduino started measuring and writhing in ' + tabN + '; Return Value = ' + data))
  }

  getNewValues() {
    return this.http.get<Messwert[]>(this.apiURL);
  }

  getTables() {
    return this.http.get<string[]>(this.apiURL + '/management');
  }
}