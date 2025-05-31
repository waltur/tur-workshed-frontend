import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { ContactService } from '../../../contacts/services/contact.service';

@Component({
  selector: 'app-group-timesheets',
  templateUrl: './group-timesheets.component.html'
})
export class GroupTimesheetsComponent implements OnInit {
  eventId!: number;
  contacts: any[] = [];
  timesheets: any[] = [];
  sheet = { id_contact: 0, hours: '', activity: '' };

  constructor(private route: ActivatedRoute, private groupService: GroupService, private contactService: ContactService) {}

  ngOnInit(): void {
    this.eventId = +this.route.snapshot.paramMap.get('id')!;
    this.loadTimesheets();
    this.contactService.getContacts().subscribe(res => this.contacts = res);
  }

  loadTimesheets() {
    this.groupService.getTimesheetsByEvent(this.eventId).subscribe(res => this.timesheets = res);
  }

  submitSheet() {
    if (!this.sheet.id_contact || !this.sheet.hours) return;
    this.groupService.createTimesheet({ ...this.sheet, id_event: this.eventId }).subscribe(() => {
      this.sheet = { id_contact: 0, hours: '', activity: '' };
      this.loadTimesheets();
    });
  }
}
