import { Component } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import Swal from 'sweetalert2';
import { GroupService } from '../../../groups/services/group.service';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('expandCollapse', [
      state('void', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('*', style({
        height: '*',
        opacity: 1
      })),
      transition('void <=> *', animate('250ms ease-in-out'))
    ])
  ]
})
export class DashboardComponent {
  roles: string[] = [];
    username = '';
    email = '';
    role = '';
    userInfoText = '';
    canChangePassword = false;

   /*  */
   myEvents: any[] = [];
   nextEvent: any = null;

   completedEvents = 0;
   upcomingEvents = 0;
   missedEvents = 0;

   attendanceRate = 0;
   activeTab: 'completed' | 'upcoming' | 'missed' | null = null;

   completedList: any[] = [];
   upcomingList: any[] = [];
   missedList: any[] = [];
   showAll = false;
   isLoading = true;
   selectedYear: number | null = null;
   selectedGroup: string | null = null;
   /* */

    constructor(private authService: AuthService,private groupService: GroupService ) {
      //this.roles = this.authService.getUserRoles();
      const userInfo = this.authService.getUserInfo();
          if (userInfo) {
            this.username = userInfo.username;
            this.email = userInfo.email;
            this.roles = userInfo.roles;
            this.role=userInfo.roles[0];
          }
    }
 ngOnInit(): void {
   this.loadMyEvents();
   const user = this.authService.getUserInfo();
   if (user) {
     this.userInfoText =
       `Name: ${user.username}\n` +
       `Email: ${user.email}\n` +
       `Roles: ${user.roles.join(', ')}`;
   }
  this.canChangePassword = this.roles.includes('Volunteer') || this.roles.includes('Member');
 }

/*loadMyEventsCount() {
  const contactId = this.authService.getContactId();
  if (!contactId) return;

  this.groupService.getMyEventsCount(contactId)
    .subscribe(res => {
      this.myEventsCount = res.total;
    });
}*/
pageSize = 10;
currentPage = 1;

get paginatedList() {
  const list =
    this.activeTab === 'completed' ? this.completedList :
    this.activeTab === 'upcoming' ? this.upcomingList :
    this.missedList;

  const start = (this.currentPage - 1) * this.pageSize;
  return list.slice(start, start + this.pageSize);
}
get filteredByYear() {
  if (!this.selectedYear) return this.myEvents;

  return this.myEvents.filter(e =>
    new Date(e.start).getFullYear() === this.selectedYear
  );
}
get totalPages() {
  const list =
    this.activeTab === 'completed' ? this.completedList :
    this.activeTab === 'upcoming' ? this.upcomingList :
    this.missedList;

  return Math.ceil(list.length / this.pageSize);
}
get visibleList() {
  const list =
    this.activeTab === 'completed' ? this.completedList :
    this.activeTab === 'upcoming' ? this.upcomingList :
    this.missedList;

  if (!this.showAll) {
    return list.slice(0, 5);
  }

  return list;
}
get availableGroups() {
  return [...new Set(this.myEvents.map(e => e.group_name))];
}

get fullyFilteredEvents() {
  let list = this.filteredByYear;

  if (this.selectedGroup) {
    list = list.filter(e => e.group_name === this.selectedGroup);
  }

  return list;
}
loadMyEvents() {
   const contactId = this.authService.getContactId();
  if (!contactId) return;

  this.groupService.getAllEvents(contactId)
    .subscribe(events => {
     this.isLoading = false;
      const now = new Date();

      this.myEvents = events
        .filter(e => e.registration_roles?.length > 0)
        .map(e => {
          const eventDate = new Date(e.start);

          let status: 'completed' | 'upcoming' | 'missed';

          if (e.attended) {
            status = 'completed';
          } else if (eventDate > now) {
            status = 'upcoming';
          } else {
            status = 'missed';
          }

          return { ...e, status };
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    this.completedList = this.myEvents.filter(e => e.status === 'completed');
    this.upcomingList = this.myEvents.filter(e => e.status === 'upcoming');
    this.missedList = this.myEvents.filter(e => e.status === 'missed');

    this.completedEvents = this.completedList.length;
    this.upcomingEvents = this.upcomingList.length;
    this.missedEvents = this.missedList.length;

      this.nextEvent = this.myEvents.find(e => e.status === 'upcoming') || null;

      const totalPast = this.completedEvents + this.missedEvents;
      this.attendanceRate = totalPast > 0
        ? Math.round((this.completedEvents / totalPast) * 100)
        : 100;
    });
}
toggleTab(tab: 'completed' | 'upcoming' | 'missed') {
  this.activeTab = this.activeTab === tab ? null : tab;
}
    isAdmin(): boolean {
      return this.roles.includes('Admin');
    }

    isStaff(): boolean {
      return this.roles.includes('Staff');
    }

    isVolunteer(): boolean {
      return this.roles.includes('Volunteer');
    }

  openChangePasswordDialog() {
    Swal.fire({
      title: 'Change Password',
      html:
        `<input type="password" id="current" class="swal2-input" placeholder="Current password">` +
        `<input type="password" id="new" class="swal2-input" placeholder="New password">` +
        `<input type="password" id="confirm" class="swal2-input" placeholder="Confirm new password">`,
      focusConfirm: false,
      preConfirm: () => {
        const current = (document.getElementById('current') as HTMLInputElement).value;
        const newPass = (document.getElementById('new') as HTMLInputElement).value;
        const confirm = (document.getElementById('confirm') as HTMLInputElement).value;

        if (!current || !newPass || !confirm) {
          Swal.showValidationMessage('All fields are required');
          return;
        }
        if (newPass !== confirm) {
          Swal.showValidationMessage('Passwords do not match');
          return;
        }

        return { current, newPass };
      }
    }).then(result => {
      if (result.isConfirmed) {
        const { current, newPass } = result.value;
        this.authService.changePassword(current, newPass).subscribe({
          next: () => Swal.fire('Success', 'Password changed successfully', 'success'),
          error: err => Swal.fire('Error', err.error?.message || 'Failed to change password', 'error')
        });
      }
    });
  }
}
