import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
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
emailInUse: boolean = false;
usernameInUse: boolean = false;
step: number = 1;
roles: any[] = [];
selectedRoleIds: number[] = [];
isAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private roleService:RoleService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
       name: ['', Validators.required],
       phone_number: [''],
       email: ['', [Validators.required, Validators.email]],
       username: ['', Validators.required],
       password: ['', Validators.required]
    });
    this.isAdmin = this.authService.isAdmin();
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: () => {
        this.registerError = 'Failed to load roles from server.';
      }
    });
  }
togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}
submit(): void {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }
  if (this.emailInUse) {
    this.registerError = 'This email is already registered.';
    return;
  }
  if (this.selectedRoleIds.length === 0) {
    this.registerError = 'Please select at least one role.';
    return;
  }
  if (this.usernameInUse) {
    this.registerError = 'This username is already taken.';
    return;
  }
 const formData = {
    ...this.registerForm.value,
    roles: this.selectedRoleIds
  };
  this.authService.register(formData).subscribe({
    next: () => {
      alert('Registration successful! You can now log in.');
      this.router.navigate(['/login']);
    },
    error: () => {
      this.registerError = 'Registration failed. Email may already be in use.';
    }
  });
}
checkEmail(): void {
  const email = this.registerForm.get('email')?.value;
  if (!email) return;

  this.authService.checkEmail(email).subscribe(res => {
    this.emailInUse = res.exists;
  });
}

checkUsername(): void {
  const username = this.registerForm.get('username')?.value;
  if (!username) return;

  this.authService.checkUsername(username).subscribe(res => {
    this.usernameInUse = res.exists;
  });
}
nextStep(): void {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  this.step = 2;
}

backStep(): void {
  this.step = 1;
}
toggleRole(roleId: number): void {
  console.log("toggleRole");
  const index = this.selectedRoleIds.indexOf(roleId);
  if (index === -1) {
    this.selectedRoleIds.push(roleId);
  } else {
    this.selectedRoleIds.splice(index, 1);
  }
}
isPublicRole(roleName: string): boolean {
  const publicRoles = ['volunteer', 'member'];
  return this.isAdmin || publicRoles.includes(roleName.toLowerCase());
}

}
