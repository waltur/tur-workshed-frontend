import { Component, OnInit } from '@angular/core';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit {
    contacts: any[] = [];

    constructor(private contactService: ContactService) {}

    ngOnInit(): void {
        this.loadContacts();
      }

      loadContacts(): void {
        this.contactService.getContacts().subscribe(data => {
          this.contacts = data;
        });
      }
}
