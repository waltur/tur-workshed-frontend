import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent  {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router:Router) {}


onSubmit() {
  if (this.form.valid) {
     this.loading = true;
    this.authService.forgotPassword(this.form.value.email!).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Email Sent',
          text: 'Check your email for reset instructions.',
          confirmButtonColor: '#d33'
        }).then(() => {
          this.loading = false;
          this.router.navigate(['/login']);
        });
      },
      error: err => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.error?.error || 'Something went wrong. Please try again.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}

}
