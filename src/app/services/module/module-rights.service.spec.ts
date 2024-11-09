import { TestBed } from '@angular/core/testing';

import { ModuleRightsService } from './module-rights.service';

describe('ModuleRightsService', () => {
  let service: ModuleRightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModuleRightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
