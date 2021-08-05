import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable()
export class ApiLoggerService {
  location = 'http://localhost:5000/errorlogger';
  constructor(  private http: HttpClient) {
  }
  log(entry) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<any>(this.location, { errorMessage: entry }, httpOptions).subscribe(data => (console.log(data)));
  }
}
