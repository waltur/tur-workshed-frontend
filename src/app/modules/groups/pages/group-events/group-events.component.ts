import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-group-events',
  templateUrl: './group-events.component.html'
})
export class GroupEventsComponent implements OnInit {
  groupId!: number;
  event = { title: '', description: '', event_date: '', location: '' };
  events: any[] = [];

  constructor(private route: ActivatedRoute, private groupService: GroupService) {}

  ngOnInit(): void {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    this.loadEvents();
  }

  loadEvents() {
    this.groupService.getEventsByGroup(this.groupId).subscribe(res => this.events = res);
  }

  addEvent() {
    const data = { ...this.event, id_group: this.groupId };
    this.groupService.createEvent(data).subscribe(() => {
      this.event = { title: '', description: '', event_date: '', location: '' };
      this.loadEvents();
    });
  }
}
