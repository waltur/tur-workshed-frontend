import { Component, OnInit } from '@angular/core';
import { GroupService } from './services/group.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import {
  trigger,
  style,
  transition,
  animate,
  state
} from '@angular/animations';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
    animations: [
      trigger('fadeSlide', [
        transition(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ]),
        transition(':leave', [
          animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
        ])
      ])
    ]
})
export class GroupsComponent implements OnInit{
  groups: any[] = [];
  selectedGroup: any = null;
  showMembers: boolean = false;
  groupMembers: any[] = [];

  constructor(private groupService: GroupService, private router: Router, private authService:AuthService) {}

  ngOnInit(): void {

    this.groupService.getGroups().subscribe(data => this.groups = data);
  }
 isLogged():void{
    const contactId = this.authService.getContactId() ?? undefined;
   }

selectGroup(group: any): void {
  this.selectedGroup = group;
  this.showMembers = false;
  this.groupMembers = [];

  // Opcionalmente puedes cargar miembros de inmediato
  this.groupService.getGroupMembers(group.id_group).subscribe(members => {
    this.groupMembers = members;
  });
}
  showGroupMembers(members: any[]) {
    this.groupMembers = members;
    this.showMembers = true;
  }
isAdmin(): boolean{
   return this.authService.isAdmin()
  }

toggleMembers(): void {
  this.showMembers = !this.showMembers;
}
goToAddMembers(): void {
  this.router.navigate(['/groups', this.selectedGroup.id_group, 'members']);
}
}
