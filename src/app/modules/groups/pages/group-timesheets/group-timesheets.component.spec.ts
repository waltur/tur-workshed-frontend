import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTimesheetsComponent } from './group-timesheets.component';

describe('GroupTimesheetsComponent', () => {
  let component: GroupTimesheetsComponent;
  let fixture: ComponentFixture<GroupTimesheetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupTimesheetsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupTimesheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
