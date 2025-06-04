import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
 /* form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword:['', [Validators.required, Validators.minLength(6)]]
  });*/


  token!: string;
  form!: FormGroup;
  showPassword = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const tokenFromUrl = this.route.snapshot.paramMap.get('token');
    if (!tokenFromUrl) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Link',
        text: 'Password reset token is missing or invalid.'
      });
      return;
    }

    this.token = tokenFromUrl;

    this.form = this.fb.group({
      password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: this.fb.control('', Validators.required)
    }, { validators: this.passwordsMatch });
  }


togglePassword() {
  this.showPassword = !this.showPassword;
}

toggleConfirm() {
  this.showConfirm = !this.showConfirm;
}
passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { notMatching: true };
}

onSubmit() {
  console.log("cambiar pass");
    if (this.form.invalid) {
       if (this.form.errors?.['notMatching']) {
         Swal.fire({
           icon: 'error',
           title: 'Oops...',
           text: 'Passwords do not match!',
         });
       }
       return; // Salimos si hay error
     }
  const newPassword = this.form.value.password;
  this.authService.resetPassword(this.token!, newPassword!).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: 'Password reset!',
        text: 'You can now log in with your new password.',
        confirmButtonColor: '#3085d6'
      }).then(() => this.router.navigate(['/login']));
    },
    error: () => {
      Swal.fire('Error', 'Failed to reset password', 'error');
    }
  });
}
}
