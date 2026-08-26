import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../modules/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.css']
})
export class MembershipComponent implements OnInit {

  loading = true;
  hasMembership = false;
  isActive = false;
  membership: any = null;
  isLoggedIn = false;
  paypalOrderId = '';
  paypalCaptureId = '';
  isMemberSelected = false;
  paypalAmount: number = 0;
  paypalCurrency: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

ngOnInit(): void {

  this.isLoggedIn = this.authService.isLoggedIn();

  if (this.isLoggedIn) {

    this.loadMembership();

  } else {

    this.loading = false;

  }

}
  loadMembership(): void {

    this.loading = true;

    this.authService.getMembershipStatus().subscribe({

      next: (response) => {

        console.log(
          'MEMBERSHIP:',
          response
        );

        this.hasMembership =
          response.hasMembership;

        this.isActive =
          response.isActive;

        this.membership =
          response.membership;

        this.loading = false;

      },

      error: (error) => {

        console.error(
          'Membership error:',
          error
        );

        this.loading = false;

      }

    });

  }
goToLogin(): void {
  console.log('CLICK LOGIN');
  this.router.navigate(['/login']).then(result => {
    console.log('LOGIN NAVIGATION:', result);
  });
}

goToRegister(): void {
  console.log('CLICK REGISTER');
  this.router.navigate(['/login/register']).then(result => {
    console.log('REGISTER NAVIGATION:', result);
  });
}
onPaymentSuccess(payment: any): void {

  console.log('PAYMENT SUCCESS:', payment);

  this.loading = true;

  this.authService.getMembershipStatus().subscribe({

    next: (response) => {

      console.log(
        'MEMBERSHIP AFTER PAYMENT:',
        response
      );

      this.hasMembership =
        response.hasMembership;

      this.isActive =
        response.isActive;

      this.membership =
        response.membership;

      this.loading = false;

    },

    error: (error) => {

      console.error(
        'Error loading membership after payment:',
        error
      );

      this.loading = false;

    }

  });

}
}
