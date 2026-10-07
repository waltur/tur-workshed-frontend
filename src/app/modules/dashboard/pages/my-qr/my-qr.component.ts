import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-my-qr',
  templateUrl: './my-qr.component.html',
  styleUrls: ['./my-qr.component.css']
})
export class MyQrComponent implements OnInit {

  username = '';
  email = '';
  userInfoText = '';

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    const user = this.authService.getUserInfo();

    if (user) {

      this.username = user.username || '';
      this.email = user.email || '';

      this.userInfoText =
        `Name: ${user.username}\n` +
        `Email: ${user.email}\n` +
        `Roles: ${user.roles?.join(', ') || ''}`;
    }
  }
}
