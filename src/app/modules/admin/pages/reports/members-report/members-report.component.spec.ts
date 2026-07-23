import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersReportComponent } from './members-report.component';

describe('MembersReportComponent', () => {
  let component: MembersReportComponent;
  let fixture: ComponentFixture<MembersReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembersReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembersReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
