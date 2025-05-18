import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VolunteersRoutingModule } from './volunteers-routing.module';
import { VolunteerListComponent } from './pages/volunteer-list/volunteer-list.component';
import { VolunteerFormComponent } from './pages/volunteer-form/volunteer-form.component';


@NgModule({
  declarations: [
    VolunteerListComponent,
    VolunteerFormComponent
  ],
  imports: [
    CommonModule,
    VolunteersRoutingModule,
    FormsModule
  ]
})
export class VolunteersModule { }
