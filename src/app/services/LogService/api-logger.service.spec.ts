import { TestBed } from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import { ApiLoggerService } from './api-logger.service';

describe('ApiLoggerService', () => {
  let service: ApiLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(ApiLoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
