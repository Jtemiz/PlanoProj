import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DBHandlerApiService} from '../db_handler/db-handler-api.service';

@Injectable()
export class ApiLoggerService {
  constructor(  private http: HttpClient, public DBHandler: DBHandlerApiService) {
  }
  location = this.DBHandler.apiURL + 'errorlogger';
  log(entry) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<any>(this.location, { errorMessage: entry }, httpOptions).subscribe(data => (console.log(data)));
  }
}
