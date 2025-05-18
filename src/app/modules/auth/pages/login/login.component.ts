import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
loginForm!: FormGroup;
 loginError: string = '';
 showPassword: boolean = false;

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

 submit(): void {
   this.loginError = '';

   if (this.loginForm.invalid) {
     this.loginForm.markAllAsTouched();
     return;
   }

   const { email, password } = this.loginForm.value;

   this.authService.login(email, password).subscribe({
     next: () => {
       const roles = this.authService.getUserRoles();

       if (roles.includes('admin')) {
         this.router.navigate(['/dashboard']);
       } else if (roles.includes('staff')) {
         this.router.navigate(['/dashboard']);
       } else if (roles.includes('volunteer')) {
         this.router.navigate(['/volunteers']);
       } else {
         this.router.navigate(['/']);
       }
     },
     error: () => {
       this.loginError = 'Invalid email or password';
     }
   });
 }
togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}
}
