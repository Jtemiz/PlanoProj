import { TestBed } from '@angular/core/testing';

import { ApiLoggerService } from './api-logger.service';

describe('ApiLoggerService', () => {
  let service: ApiLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiLoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
