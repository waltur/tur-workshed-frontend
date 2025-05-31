import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { ContactService } from '../../../contacts/services/contact.service';

@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.component.html'
})
export class GroupMembersComponent implements OnInit {
  groupId!: number;
  members: any[] = [];
  contacts: any[] = [];
  newMember = { id_contact: 0, role_in_group: '' };

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    this.loadMembers();
    this.loadContacts();
  }

  loadMembers() {
    this.groupService.getGroupMembers(this.groupId).subscribe(res => this.members = res);
  }

  loadContacts() {
    this.contactService.getContacts().subscribe(res => this.contacts = res);
  }

  addMember() {
    if (!this.newMember.id_contact || !this.newMember.role_in_group) return;
    this.groupService.addGroupMember(this.groupId, this.newMember).subscribe(() => {
      this.newMember = { id_contact: 0, role_in_group: '' };
      this.loadMembers();
    });
  }

  removeMember(id: number) {
    this.groupService.removeGroupMember(this.groupId, id).subscribe(() => this.loadMembers());
  }
}
