import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
registerForm!: FormGroup;
showPassword: boolean = false;
registerError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}
 submit(): void {
   this.registerError = '';
   if (this.registerForm.invalid) {
     this.registerForm.markAllAsTouched();
     return;
   }

   const { username, email, password } = this.registerForm.value;

   this.authService.register(username, email, password).subscribe({
     next: () => {
       alert('Registration successful! You can now log in.');
       this.router.navigate(['/login']);
     },
     error: (err) => {
       this.registerError = 'Registration failed. Email may already be in use.';
       console.error(err);
     }
   });
 }
}
