import { Component, OnInit } from '@angular/core';
import { ContactService, Contact } from '../../services/contact.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent implements OnInit  {
  contact: Contact = {
    name: '',
    email: '',
    phone_number: '',
    type: '',
    id_contact: 0,
  };
 isEditMode = false;
  constructor(
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    console.log("init");
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.contactService.getContactById(+id).subscribe(data => {
        this.contact = data;
      });
    }
  }
 submit(): void {
   console.log("edicion contacto");
   if (this.isEditMode && this.contact.id_contact !== undefined) {
     this.contactService.updateContact(this.contact.id_contact, this.contact).subscribe(() => {
       this.router.navigate(['/contacts']);
     });
   } else {
     this.contactService.createContact(this.contact).subscribe(() => {
       this.router.navigate(['/contacts']);
     });
   }
 }
}
