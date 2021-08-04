import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LogPublisher, LogWebApi } from './log-publisher';

@Injectable()
export class LogPublishersService {
  constructor(private http: HttpClient) {
    // Build publishers arrays
    this.buildPublishers();
  }

  // Public properties
  publishers: LogPublisher[] = [];

  // Build publishers array
  buildPublishers(): void {
    // Create instance of LogConsole Class
    this.publishers.push(new LogWebApi(this.http));
  }
}
