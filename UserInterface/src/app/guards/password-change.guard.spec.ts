import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { passwordChangeGuard } from './password-change.guard';

describe('passwordChangeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => passwordChangeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
