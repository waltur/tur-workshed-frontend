import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactFormComponent } from './pages/contact-form/contact-form.component';
import { ContactListComponent } from './pages/contact-list/contact-list.component';

const routes: Routes = [
    { path: '', component: ContactListComponent },
    { path: 'new', component: ContactFormComponent },
    { path: 'edit/:id', component: ContactFormComponent },
    ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactsRoutingModule { }
