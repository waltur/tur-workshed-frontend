import { Component } from '@angular/core';
import { VolunteerService, Volunteer } from '../../services/volunteer.service';
import { Router } from '@angular/router';
import { ContactService, Contact } from '../../../contacts/services/contact.service';

@Component({
  selector: 'app-volunteer-form',
  templateUrl: './volunteer-form.component.html',
  styleUrls: ['./volunteer-form.component.css']
})
export class VolunteerFormComponent {
  volunteer: Volunteer = {
    id_contact: 0,
    role: '',
    skills: [],
    availability: '',
    status: '1' as string,
    backgroundCheck: false
  };
  contacts: Contact[] = [];
 constructor(
    private volunteerService: VolunteerService,
    private router: Router,
    private contactService: ContactService,
  ) {}
  ngOnInit(): void {
    this.contactService.getContacts().subscribe(data => {
      this.contacts = data;
    });
  }
 submit(): void {
   console.log(this.volunteer);
    this.volunteerService.createVolunteer(this.volunteer).subscribe(() => {
      this.router.navigate(['/volunteers']);
    });
  }
onCheckboxChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.volunteer.backgroundCheck = input.checked;
}
}
