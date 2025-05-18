import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VolunteerListComponent } from './pages/volunteer-list/volunteer-list.component';
import { VolunteerFormComponent } from './pages/volunteer-form/volunteer-form.component';

const routes: Routes = [
    { path: '', component: VolunteerListComponent },
    { path: 'new', component: VolunteerFormComponent },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VolunteersRoutingModule { }
