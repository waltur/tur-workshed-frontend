import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
loginForm!: FormGroup;
 loginError: string = '';
 showPassword: boolean = false;
 registrationMessage = false;
 loading=false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
showRegistrationMessage() {
  // Mostrar el mensaje luego de hacer clic en el enlace
  this.registrationMessage = true;

  // Ocultar el mensaje después de unos segundos (opcional)
  setTimeout(() => {
    this.registrationMessage = false;
  }, 8000);
}
submit(): void {
  this.loading=true;
  console.log("login");
  this.loginError = '';
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    this.loading=false;
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: 'Please fill in all required fields.'
    });

    return;
  }


  const { email, password } = this.loginForm.value;

  this.authService.login(email, password)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: () => {
        const roles = this.authService.getUserRoles();
        if (roles.includes('Admin')) {
          this.router.navigate(['/admin']);
        } else if (roles.includes('Staff')) {
          this.router.navigate(['/dashboard']);
        } else if (roles.includes('Volunteer')) {
          this.router.navigate(['/volunteers']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        let message = 'Invalid email or password.';
        if (error.status === 401 && error.error?.message) {
          message = error.error.message;
        } else if (error.status === 0) {
          message = 'Unable to connect to the server.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: message
        });
      }
    });
}
togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}
}
