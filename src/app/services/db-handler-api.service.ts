import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {Messwert} from '../Messwert';
import {Messung} from '../sites/datenbestand/datenbestand.component';


@Injectable({
  providedIn: 'root'
})

export class DBHandlerApiService {
  constructor(private http: HttpClient) { }
  public messwert: Messwert[];
  private apiURL = 'http://192.168.178.153:5000/';

  /**
   * Sends a request to the API to set an comment on an specific position of the measurement.
   * Put-Request accessable on 192.168.178.153/ with body [kommentar: string, position: int]
   */
  setComment(str: string, at: number) {
   return this.http.put<any>(this.apiURL, {kommentar: str, position: at})
      .subscribe(data => console.log(data));
  }

  /**
   * Sends a request to the API to Create a new Table with the current Date as name (Format YYYYMMDDHHMM).
   * Put-Request accessable on 192.168.178.153/start with body tablename: int
   */
  createTable() {
    const date: Date = new Date(Date.now());
    const tabN: string = date.getFullYear()
      + ('0' + (date.getMonth() + 1)).slice(-2)
      + ('0' + date.getDate()).slice(-2)
      + ('0' + date.getHours()).slice(-2)
      + ('0' + date.getMinutes()).slice(-2)
      + ('0' + date.getSeconds()).slice(-2);
    console.log('tableName generated ' + tabN);
    this.http.put<any>(this.apiURL + 'start', {tableName: tabN} ).subscribe(data => console.log("created new table: " + tabN + "; Return Value = " + data),
      error => console.log(error));
  }


  /**
   * Sends a request on API to stop the measuring on the Arduino.
   * Get-Request is accessable on 192.168.178.153/stop
   */
  stopArduino() {
    return this.http.get(this.apiURL + 'stop').subscribe(data => console.log(data));
  }

  /**
   * sends a request to the API to get all values that haven't been received yet.
   * Get-request is accessable on 192.168.178.153/<Param: int>
   * @param lastPos means the newest received value
   */
  getNewValues(lastPos: number) {
    return this.http.get<any>(this.apiURL + 'measuring');
  }
  /**
   * sends a request to the API to get all existing tables in the Database (so all done measurements)
   * Get-request is accessable on 192.168.178.153/management
   */
  getAllTables() {
    return this.http.get<Messung[]>(this.apiURL + 'management');
  }

  /**
   * @TODO
   */
  getTable(tableName: string) {
    return this.http.get<Messwert[]>(this.apiURL + 'datenbestand/' + tableName);
  }

  isMActive(): boolean {
    let mIsActive: boolean;
    this.http.get<boolean>(this.apiURL + 'ismactive').subscribe(data => (mIsActive = data));
    if (mIsActive == true) {
      return true;
    } else {
      return false;
    }
  }
}
