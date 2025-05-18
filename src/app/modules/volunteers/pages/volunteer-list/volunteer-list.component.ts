import { Component, OnInit } from '@angular/core';
import { VolunteerService, Volunteer } from '../../services/volunteer.service';

@Component({
  selector: 'app-volunteer-list',
  templateUrl: './volunteer-list.component.html',
  styleUrls: ['./volunteer-list.component.css']
})
export class VolunteerListComponent implements OnInit {
  volunteers: Volunteer[] = [];

  constructor(private volunteerService: VolunteerService) {}


   ngOnInit(): void {
    this.volunteerService.getVolunteers().subscribe(data => {
      this.volunteers = data;
    });
  }
}
