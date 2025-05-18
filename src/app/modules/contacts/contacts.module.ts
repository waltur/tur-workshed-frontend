import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactFormComponent } from './pages/contact-form/contact-form.component';
import { ContactsRoutingModule } from './contacts-routing.module';
import { FormsModule } from '@angular/forms';
import { ContactListComponent } from './pages/contact-list/contact-list.component';



@NgModule({
  declarations: [
    ContactFormComponent,
    ContactListComponent,
    ],
  imports: [
    CommonModule,
    ContactsRoutingModule,
    FormsModule,
  ]
})
export class ContactsModule { }
