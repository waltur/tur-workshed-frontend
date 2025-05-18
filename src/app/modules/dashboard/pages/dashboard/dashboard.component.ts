import { Component } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

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

    isAdmin(): boolean {
      return this.roles.includes('admin');
    }

    isStaff(): boolean {
      return this.roles.includes('staff');
    }

    isVolunteer(): boolean {
      return this.roles.includes('volunteer');
    }
}
