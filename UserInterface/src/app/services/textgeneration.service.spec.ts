import { TestBed } from '@angular/core/testing';

import { TextgenerationService } from './textgeneration.service';

describe('TextgenerationService', () => {
  let service: TextgenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextgenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
