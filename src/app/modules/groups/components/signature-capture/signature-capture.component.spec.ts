import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureCaptureComponent } from './signature-capture.component';

describe('SignatureCaptureComponent', () => {
  let component: SignatureCaptureComponent;
  let fixture: ComponentFixture<SignatureCaptureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignatureCaptureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignatureCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
