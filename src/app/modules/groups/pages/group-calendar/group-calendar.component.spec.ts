import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCalendarComponent } from './group-calendar.component';

describe('GroupCalendarComponent', () => {
  let component: GroupCalendarComponent;
  let fixture: ComponentFixture<GroupCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
