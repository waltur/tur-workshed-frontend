import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { ContactService } from '../../../contacts/services/contact.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.component.html'
})
export class GroupMembersComponent implements OnInit {
  groupId!: number;
  members: any[] = [];
  contacts: any[] = [];
  newMember = { id_contact: 0, role_in_group: '' };
  groupRoles: any[] = [];
  isCurrentUserMember: boolean = false;
  canAddMembers: boolean = false;
  groupCoordinator: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private contactService: ContactService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    this.loadMembers();
    this.loadContacts();
    this.loadGroupRoles();
  }
loadMembers() {
  console.log("loadMembers");
  this.groupService.getGroupMembers(this.groupId).subscribe(res => {
    //const idContact = Number(localStorage.getItem('id_contact'));
   const idContact= this.authService.getContactId() ?? undefined;

     const coordinator = res.find(m => m.name_role === 'Coordinator');
         if (coordinator) {
          this.groupCoordinator = res.some(
            (member: any) => member.id_contact === idContact && member.name_role === 'Coordinator'
          );
       }

   if (this.userCanAssignRestrictedRoles()) {
      this.members = res;
    } else {
      this.members = res.filter((member: any) => member.id_contact === idContact);
    }

    //this.isCurrentUserMember = res.some((member: any) => member.id_contact === idContact);
    const isMember = res.some((member: any) => member.id_contact === idContact);
    this.isCurrentUserMember = isMember;
    this.canAddMembers = !isMember || this.userCanAssignRestrictedRoles();
  });
}

isRestricted(roleName: string): boolean {
  return ['Coordinator', 'Guest'].includes(roleName);
}

userCanAssignRestrictedRoles(): boolean {

  //return this.authService.isAdmin() || this.newMember.role_in_group === '1' ;
  return this.authService.isAdmin() || this.groupCoordinator ;

}

  loadContacts() {
    console.log("loadContacts");
    this.contactService.getContacts().subscribe(res => {

         const idContact= this.authService.getContactId() ?? undefined;
         if (this.userCanAssignRestrictedRoles()) {
             this.contacts = res;
          } else {
            this.contacts = res.filter((contact: any) => contact.id_contact === idContact);
          }

      });
  }

isAdmin(): boolean{
   return this.authService.isAdmin()
}

addMember() {
  console.log("addMember");

  if (!this.newMember.id_contact || !this.newMember.role_in_group) return;

  const alreadyCoordinator = this.members.some(
    member => member.name_role === 'Coordinator'
  );

  if (this.newMember.role_in_group === '1' && alreadyCoordinator) {
    Swal.fire({
      icon: 'warning',
      title: 'Coordinator Exists',
      text: 'Only one Coordinator is allowed per group.'
    });
    return;
  }

  const alreadyExists = this.members.some(
    member => member.id_contact === Number(this.newMember.id_contact)
  );

  if (alreadyExists) {
    Swal.fire({
      icon: 'warning',
      title: 'Already a Member',
      text: 'This contact is already registered in the group.'
    });
    return;
  }

  // Si es rol Coordinador, validar si tiene el job_role requerido
  if (this.newMember.role_in_group === '1') {
    this.contactService.getContactJobRoles(this.newMember.id_contact).subscribe(roles => {
      if (!roles.some(r => r.title === 'Class/Group leaders')) {
        Swal.fire('Not allowed', 'This contact is not a Class/Group Leader.', 'warning');
        return;
      }

      // ✅ Si pasa todas las validaciones, agregar el miembro
      this.groupService.addGroupMember(this.groupId, this.newMember).subscribe(() => {
        this.newMember = { id_contact: 0, role_in_group: '' };
        this.loadMembers();
      });
    });
  } else {
    // Si no es Coordinador, agregar directamente
    this.groupService.addGroupMember(this.groupId, this.newMember).subscribe(() => {
      this.newMember = { id_contact: 0, role_in_group: '' };
      this.loadMembers();
    });
  }
}

  removeMember(id: number) {
    this.groupService.removeGroupMember(this.groupId, id).subscribe(() => this.loadMembers());
  }
  loadGroupRoles(): void {
    this.groupService.getGroupRoles().subscribe({
      next: (data) => this.groupRoles = data,
      error: (err) => console.error('Error loading group roles', err)
    });
  }
}
