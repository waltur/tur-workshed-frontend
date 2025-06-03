import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html'
})
export class GroupListComponent implements OnInit {
  groups: any[] = [];

  constructor(private groupService: GroupService) {}

  ngOnInit(): void {
    console.log("grupo list");
    this.groupService.getGroups().subscribe(data => this.groups = data);
       console.log("this.groups",this.groups);
  }
}
