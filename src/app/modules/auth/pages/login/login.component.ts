import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { timeout, catchError,finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
/*submit(): void {
  this.loading = true;
  this.loginError = '';
  console.log("login");

  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    this.loading = false;
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: 'Please fill in all required fields.'
    });
    return;
  }

  const { email, password } = this.loginForm.value;

  this.authService.login(email, password)
    .pipe(
      timeout(10000), // ❗10 segundos de espera máxima
      catchError(err => {
        if (err.name === 'TimeoutError') {
          return throwError(() => ({
            status: 408,
            message: 'Login timed out. Invalid email or password, please try again.'
          }));
        }
        return throwError(() => err);
      }),
      finalize(() => this.loading = false)
    )
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
        console.error('Error en login:', error);

        let message = 'Invalid email or password.';

        if (error.status === 403) {
          Swal.fire('Email not verified', 'Please verify your email before logging in.' || 'Your account needs verification.', 'warning');
         /* Swal.fire({
            icon: 'info',
            title: 'Verify your email',
            html: `
              Please verify your email before logging in.<br>
              <strong><a href="/resend-verification">Resend verification email</a></strong>
            `,
          });*/
      /*    return;
        }

        if (error.status === 408) {
          message = error.message || 'Request timed out.';
        } else if (error.status === 401 && error.message) {
          message = error.message;
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
}*/
submit(): void {
  this.loading = true;

  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    this.loading = false;
    Swal.fire('Login Failed', 'Please fill in all required fields.', 'error');
    return;
  }

  const { email, password } = this.loginForm.value;

  this.authService.login(email, password)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: () => {
        // ✅ SOLO AQUÍ navegas (login exitoso)

        const roles = this.authService.getUserRoles();

        if (roles.includes('Admin')) {
          this.router.navigate(['/admin']);
        }
        else if (roles.includes('Staff')) {
          this.router.navigate(['/dashboard']);
        }
        else if (roles.includes('Volunteer')) {
          this.router.navigate(['/volunteers']);
        }
        else {
          this.router.navigate(['/']);
        }
      },

      error: (error) => {
        // ❌ aquí NO se navega
        let message = 'Invalid email or password.';

        if (error.status === 403) {
          message = 'Please verify your email before logging in.';
        }
        else if (error.status === 0) {
          message = 'Unable to connect to the server.';
        }

        Swal.fire('Login Failed', message, 'error');
      }
    });
}
togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}
}
