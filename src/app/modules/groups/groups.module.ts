import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupsRoutingModule } from './groups-routing.module';

import { GroupsComponent } from './groups.component';
import { GroupListComponent } from './pages/group-list/group-list.component';
import { GroupFormComponent } from './pages/group-form/group-form.component';
import { GroupMembersComponent } from './pages/group-members/group-members.component';
import { GroupEventsComponent } from './pages/group-events/group-events.component';
import { GroupTimesheetsComponent } from './pages/group-timesheets/group-timesheets.component';
import { GroupCalendarComponent } from './pages/group-calendar/group-calendar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterPipe } from 'src/app/shared/filter.pipe';

import {
  CalendarModule,
  DateAdapter,
  CalendarCommonModule,
  CalendarMonthModule,
  CalendarWeekModule,
  CalendarDayModule,


} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SignatureCaptureComponent } from './components/signature-capture/signature-capture.component';

@NgModule({
  declarations: [
    GroupsComponent,
    GroupListComponent,
    GroupFormComponent,
    GroupMembersComponent,
    GroupEventsComponent,
    GroupTimesheetsComponent,
    GroupCalendarComponent,
    FilterPipe,
    SignatureCaptureComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    GroupsRoutingModule,
    NgbModule,
    // Core calendar setup
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),


  ],
})
export class GroupsModule {}
