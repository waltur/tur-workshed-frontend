import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupListComponent } from './pages/group-list/group-list.component';
import { GroupFormComponent } from './pages/group-form/group-form.component';
import { GroupEventsComponent } from './pages/group-events/group-events.component';
import { GroupTimesheetsComponent } from './pages/group-timesheets/group-timesheets.component';
import { GroupMembersComponent } from './pages/group-members/group-members.component';
import { GroupCalendarComponent } from './pages/group-calendar/group-calendar.component';
import { GroupsComponent } from './groups.component';

const routes: Routes = [
{ path: '', component: GroupListComponent },
  { path: 'new', component: GroupFormComponent },
  { path: 'edit/:id', component: GroupFormComponent },
  { path: ':id/members', component: GroupMembersComponent },
  { path: ':id/events', component: GroupEventsComponent },
  { path: 'event/:id/timesheets', component: GroupTimesheetsComponent },
  { path: 'calendar', component: GroupCalendarComponent },
   { path: 'listGroup', component: GroupsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule {}
