import { TestBed } from '@angular/core/testing';

import { MemberManagerService } from './member-manager.service';

describe('MemberManagerService', () => {
  let service: MemberManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemberManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
