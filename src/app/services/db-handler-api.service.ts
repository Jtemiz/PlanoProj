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
  private apiURL = 'http://192.168.178.153:5000/';

  setComment(str: string, at: number) {
   return this.http.put<any>(this.apiURL, {kommentar: str, position: at})
      .subscribe(data => console.log(data));
  }

  createTable() {
    const date: Date = new Date(Date.now());
    const tabN: string = date.getFullYear()
      + ('0' + (date.getMonth() + 1)).slice(-2)
      + ('0' + date.getDate()).slice(-2)
      + ('0' + date.getHours()).slice(-2)
      + ('0' + date.getMinutes()).slice(-2);
    this.http.put<any>(this.apiURL + 'management', {tableName: tabN} ).subscribe(data => console.log("created new table: " + tabN + "; Return Value = " + data));
  }

  stopArduino() {
    this.http.get(this.apiURL + 'stop');
  }
  getNewValues() {
    return this.http.get<Messwert[]>(this.apiURL);
  }

  getAllTables() {
    return this.http.get<string[]>(this.apiURL + 'management');
  }

  /**
   * @TODO
   */
  getTable(tableName: string) {
    return this.http.get<Messwert[]>(this.apiURL + 'datenbestand' + '/' + tableName);
  }
}
