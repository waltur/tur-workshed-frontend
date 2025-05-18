import { Component } from '@angular/core';
import { AuthService } from '../../modules/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
userInfo = this.authService.getUserInfo();

constructor(public authService: AuthService) {}
isMenuOpen = false;

   toggleMenu() {
     this.isMenuOpen = !this.isMenuOpen;
   }
 logout() {
   this.authService.logout();
 }
}



