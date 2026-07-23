import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserFormComponent } from './pages/user-form/user-form.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AttendanceReportComponent } from './pages/attendance-report/attendance-report.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { MembersReportComponent } from './pages/reports/members-report/members-report.component';


@NgModule({
  declarations: [
    AdminComponent,
    UserListComponent,
    UserFormComponent,
    AttendanceReportComponent,
    ReportsComponent,
    MembersReportComponent,


  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AdminModule { }
