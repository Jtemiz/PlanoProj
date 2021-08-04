import {Observable, of} from 'rxjs';
import {LogEntry} from './log.service';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

export abstract class LogPublisher {
  location: string;

  abstract log(record: LogEntry): Observable<boolean>;

  abstract clear(): Observable<boolean>;
}

export class LogWebApi extends LogPublisher {
  constructor(private http: HttpClient) {
    // Must call `super()`from derived classes
    super();
    // Set location
    this.location = 'http://localhost:5000/errorlogger';
  }

  // Add log entry to back end data store
  log(entry: LogEntry): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    // return this.http.post(this.location, entry).map(response => response.json()).catch(this.handleErrors);
    return this.http.post<any>(this.location, { errorMessage: entry }, httpOptions);
  }
  clear(): Observable<boolean>{
    return undefined;
  }
  /*
  private handleErrors(error: any): Observable<any> {
    let errors: string[] = [];
    let msg: string = '';

    msg = 'Status: ' + error.status;
    msg += ' - Status Text: ' + error.statusText;
    if (error.json()) {
      msg += ' - Exception Message: ' + error.json().exceptionMessage;
    }
    errors.push(msg);

    console.error('An error occurred', errors);
    return Observable.throw(errors);
  }


   */

}
