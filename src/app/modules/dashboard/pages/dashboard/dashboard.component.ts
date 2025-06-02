import { Component } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  roles: string[] = [];
    username = '';
    email = '';
    role = '';
    userInfoText = '';
    canChangePassword = false;

    constructor(private authService: AuthService) {
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
   const user = this.authService.getUserInfo();
   if (user) {
     this.userInfoText =
       `Name: ${user.username}\n` +
       `Email: ${user.email}\n` +
       `Roles: ${user.roles.join(', ')}`;
   }
  this.canChangePassword = this.roles.includes('Volunteer') || this.roles.includes('Member');
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
