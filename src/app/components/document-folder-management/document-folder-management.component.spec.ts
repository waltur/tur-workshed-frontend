import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentFolderManagementComponent } from './document-folder-management.component';

describe('DocumentFolderManagementComponent', () => {
  let component: DocumentFolderManagementComponent;
  let fixture: ComponentFixture<DocumentFolderManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentFolderManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentFolderManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
