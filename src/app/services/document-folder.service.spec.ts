import { TestBed } from '@angular/core/testing';

import { DocumentFolderServiceService } from './document-folder.service.service';

describe('DocumentFolderServiceService', () => {
  let service: DocumentFolderServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentFolderServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
