import { Component } from '@angular/core';
import { AuthService } from '../../modules/auth/services/auth.service';
import { RoleService } from '../../modules/auth/services/role.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
 userInfo: { username: string; email: string; roles: string[] } | null = null;
//isAdmin = false;
isMenuOpen = false;
roles: string[] = [];


constructor(public authService: AuthService, public roleService: RoleService) {}


ngOnInit(): void {
 this.authService.userInfo$.subscribe(user => {
      this.userInfo = user;
    });
  this.roles = this.authService.getUserRoles();
}
   toggleMenu() {
     this.isMenuOpen = !this.isMenuOpen;
   }
 logout() {
   this.authService.logout();
 }
isAdmin(): boolean {
  return !!this.userInfo?.roles?.includes('Admin');
}

isVolunteer(): boolean {
  return !!this.userInfo?.roles?.includes('Volunteer');
}
}



