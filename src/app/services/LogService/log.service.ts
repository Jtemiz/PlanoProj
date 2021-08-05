import {ErrorHandler, Injectable} from '@angular/core';
import {ApiLoggerService} from './api-logger.service';

@Injectable()
export class CustomErrorHandlerService extends ErrorHandler {

  constructor(private logger: ApiLoggerService) {
    super();
  }

  handleError(error: Error) {
    // Here you can provide whatever logging you want
    this.logger.log(error.message);
    super.handleError(error)
  }
}
