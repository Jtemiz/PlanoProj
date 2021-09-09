import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {Messwert, Metadata} from '../../Messwert';
import {AlertService} from '../_alert';


@Injectable({
  providedIn: 'root'
})

export class DBHandlerApiService {

  constructor(private http: HttpClient, public alert: AlertService) {
  }

  public apiURL = 'http://localhost:5000/';
  //public apiURL = 'http://192.168.4.2:5000/';

  /**
   * Sends a request to the API to set an comment on an specific position of the measurement.
   * Put-Request accessable on 192.168.178.153/ with body [kommentar: string, position: int]
   */
  setComment(str: string, at: number) {
    return this.http.put<any>(this.apiURL + 'measurement', {kommentar: str, position: at});
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
    return this.http.put<any>(this.apiURL + 'start', {tableName: tabN}).subscribe(data => console.log('created new table: ' + tabN + '; Return Value = ' + data),
      err => {
        console.log(err);
        this.alert.error('Probleme in der Datenbankverbindung: Speicherung der Daten nicht möglich.');
      }
    );
  }

  startArduino() {
    return this.http.get(this.apiURL + 'start').subscribe(data => console.log(data),
      err => {
      console.log(err);
      this.alert.error('Probleme in der Verbindung zum Messmodul: Messmodul konnte nicht gestartet werden.');
      });
  }

  /**
   * Sends a request on API to stop the measuring on the Arduino.
   * Get-Request is accessable on 192.168.178.153/stop
   */
  stopArduino(plc: string, dist: number, usr: string) {
    return this.http.put(this.apiURL + 'stop', {
      place: plc,
      distance: dist,
      user: usr
    }).subscribe(data => console.log(data),
      err => {
      console.log(err);
      this.alert.error('Probleme in der Verbindung zum Messmodul: Messmodul konnte nicht gestoppt werden.');
    });
  }

  /**
   * sends a request to the API to get all values that haven't been received yet.
   * Get-request is accessable on 192.168.178.153/<Param: int>
   * @param lastPos means the newest received value
   */
  getNewValues() {
    return this.http.get<Messwert[]>(this.apiURL + 'measurement');
  }

  /**
   * sends a request to the API to get all existing tables in the Database (so all done measurements)
   * Get-request is accessable on 192.168.178.153/management
   */
  getAllTables() {
     return this.http.get<Metadata>(this.apiURL + 'tables');
  }

  /**
   * @TODO
   */
  getTable(tableName: string) {
    return this.http.get<Messwert[]>(this.apiURL + 'datenbestand/' + tableName);
  }

  isMActive() {
    return this.http.get<boolean>(this.apiURL + 'status').pipe(startWith(false)).subscribe(data => {
        console.log('db_handler' + data);
        return data;
      }
    );
  }

  startUpdate() {
    return this.http.get<any>(this.apiURL + 'update').subscribe(data => console.log(data));
  }
}
