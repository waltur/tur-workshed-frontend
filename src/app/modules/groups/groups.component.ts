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
  contactId:any;
  groupCoordinator: any = null;

  constructor(private groupService: GroupService, private router: Router, private authService:AuthService) {}

  ngOnInit(): void {

    this.loadMembers();
  }
 isLogged():void{
    this.contactId = this.authService.getContactId() ?? undefined;
   }

selectGroup(group: any): void {
  console.log("selectGroup");
  this.selectedGroup = group;
  this.showMembers = false;
  this.groupMembers = [];
  this.groupCoordinator = null;


  this.groupService.getGroupMembers(group.id_group).subscribe(members => {
    this.groupMembers = members;

    // Filtrar al coordinador
    const coordinator = members.find(m => m.name_role === 'Coordinator');
    if (coordinator) {
      this.groupCoordinator = coordinator;
    }
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
get filteredGroupMembers() {
  console.log("filteredGroupMembers");
  this.contactId = this.authService.getContactId() ?? undefined;
  //const isPrivileged = this.userCanAssignRestrictedRoles();
  if (this.userCanAssignRestrictedRoles()) return this.groupMembers;
  return this.groupMembers.filter(m => m.id_contact === this.contactId);
}
 userCanAssignRestrictedRoles(): boolean {
  return this.authService.isAdmin() ||this.authService.hasJobRole('Class/Group leaders');
}
isAlreadyMember(): boolean {
  return this.groupMembers.some(m => m.id_contact === this.contactId);
}

/*registerSelf() {
  const newMember = {
    id_group: this.groupId,
    id_contact: this.contactId,
    id_group_role: this.defaultRoleId // por ejemplo, el id del rol "Volunteer"
  };

  this.groupService.addMember(newMember).subscribe({
    next: () => {
      this.loadMembers();
    },
    error: err => {
      console.error('Error registering as member', err);
    }
  });
}*/
loadMembers(){
  this.groupService.getGroups().subscribe(data => this.groups = data);
  }
}
