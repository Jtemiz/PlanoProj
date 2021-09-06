import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DBHandlerApiService } from './db-handler-api.service';

describe('ApiLoggerService', () => {
  let service: DBHandlerApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        DBHandlerApiService
      ]
    });
    service = TestBed.inject(DBHandlerApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
