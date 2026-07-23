import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserFormComponent } from './pages/user-form/user-form.component';
//import { AuthGuard } from '../../guards/auth.guard';
import { AuthGuard } from '../../modules/auth/guards/auth.guard';
import { AttendanceReportComponent } from './pages/attendance-report/attendance-report.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { MembersReportComponent } from './pages/reports/members-report/members-report.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'users', component: UserListComponent },
      { path: 'users/new', component: UserFormComponent },
      { path: 'users/edit/:id', component: UserFormComponent },
     // { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: '', component: AdminComponent, pathMatch: 'full' },
      { path: 'attendance-report', component: AttendanceReportComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'member-report', component: MembersReportComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
