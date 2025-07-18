import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-email-sent',
  templateUrl: './email-sent.component.html',
  styleUrls: ['./email-sent.component.css']
})
export class EmailSentComponent implements OnInit {
  email: string | null = null;
    loading = false;

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email');
  }
resendEmail(): void {
    if (!this.email) return;

    this.loading = true;

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire('Email sent', 'We’ve sent another verification email.', 'success');
      },
      error: (err:any) => {
        this.loading = false;
        console.error(err);
        if (err.status === 400 && err.error.message === 'User is already verified') {
          Swal.fire('Already verified', 'Your account is already active.', 'info');
        } else if (err.status === 404) {
          Swal.fire('Not found', 'This email does not exist.', 'warning');
        } else {
          Swal.fire('Error', 'Could not resend verification email.', 'error');
        }
      }
    });
  }
}
