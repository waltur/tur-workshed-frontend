import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { JobRoleService } from '../../services/job-role.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
isVolunteer = false;
jobRoles: any[] = [];
selectedJobRoleIds: number[] = [];
volunteerRoleId: number | null = null;
ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
wantsToVolunteerLocked: boolean = false;
loading:boolean=false;
photoBase64: string | null = null;
photoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private roleService:RoleService,
     private jobRoleService:JobRoleService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      phone_number: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      emergency_contact: [''],
      username: ['', Validators.required],
      password: ['', Validators.required],

      age_range: ['', Validators.required],
      photo_permission: [false, Validators.required],
      community_preference: ['', Validators.required],

      acknowledged_rules: [false, Validators.requiredTrue],
      acknowledged_privacy: [false, Validators.requiredTrue],
      acknowledged_code_of_conduct: [false, Validators.requiredTrue],
      acknowledged_health_safety: [false, Validators.requiredTrue],

      wants_to_volunteer: [false],
      volunteer_acknowledgement: [false]
    });
    this.isAdmin = this.authService.isAdmin();
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
         const volunteerRole = this.roles.find(role => role.role_name.toLowerCase() === 'volunteer');
            this.volunteerRoleId = volunteerRole ? volunteerRole.id_role : null;
      },
      error: () => {
        this.registerError = 'Failed to load roles from server.';
      }
    });
   /*this.registerForm.get('wants_to_volunteer')?.valueChanges.subscribe(value => {
      if (value === true || value === false) {
        this.wantsToVolunteerLocked = true;
      }
    });
  */
  }
togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}
onPhotoSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    this.photoPreview = reader.result as string;
    this.photoBase64 = this.photoPreview;  // ya en formato base64 para backend
  };
  reader.readAsDataURL(file);
}
submit(): void {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  if (this.emailInUse) {
    Swal.fire({
      icon: 'error',
      title: 'Email already in use',
      text: 'Please use a different email address.',
      confirmButtonColor: '#e91e63'
    });
    return;
  }

  if (this.selectedRoleIds.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No role selected',
      text: 'You must select at least one role to continue.',
      confirmButtonColor: '#e91e63'
    });
    return;
  }

  if (this.usernameInUse) {
    Swal.fire({
      icon: 'error',
      title: 'Username taken',
      text: 'Please choose another username.',
      confirmButtonColor: '#e91e63'
    });
    return;
  }

  const isVol = this.selectedRoleIds.includes(this.volunteerRoleId!);
  console.log("isVol", isVol);

  this.registerForm.patchValue({
    wants_to_volunteer: isVol,
    volunteer_acknowledgement: isVol
  });

  const formValue = this.registerForm.value;
  formValue.email = formValue.email.toLowerCase();

  const formData = {
    ...this.registerForm.value,
    roles: this.selectedRoleIds,
    job_roles: this.selectedJobRoleIds
  };
  if (this.registerForm.get('photo_permission')?.value === 'true' && this.photoBase64) {
    formData.photoBase64 = this.photoBase64;
  }
  this.loading = true; // ⏳ Inicia loading

  this.authService.register(formData).subscribe({
    next: () => {
      this.loading = false; // ✅ Finaliza loading
      Swal.fire({
        icon: 'success',
        title: 'Registration Complete',
        text: 'You can now log in.',
        confirmButtonColor: '#e91e63'
      }).then(() => {
        this.router.navigate(['/login/email-sent'], { queryParams: { email: formValue.email } });
      });
    },
    error: () => {
      this.loading = false; // ❌ Finaliza loading si ocurre error
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: 'Something went wrong. Please try again later.',
        confirmButtonColor: '#e91e63'
      });
    }
  });
}


checkEmail(): void {
  const email = this.registerForm.get('email')?.value;
  if (!email) return;

  this.authService.checkEmail(email.toLowerCase()).subscribe(res => {
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
  if (this.step === 1) {
    if (this.registerForm.invalid) {
      const invalidFields = this.getInvalidFieldNames();
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete form',
        html: `Please complete:<br><strong>${invalidFields.join(', ')}</strong>`,
        confirmButtonColor: '#e91e63'
      });
      this.registerForm.markAllAsTouched();
      return;
    }

    this.step++;
    return;
  }

  if (this.step === 2) {
    if (this.selectedRoleIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No role selected',
        text: 'Please select at least one role.',
        confirmButtonColor: '#e91e63'
      });
      return;
    }

    this.isVolunteer = this.selectedRoleIds.includes(this.volunteerRoleId!);
   // const selectedVol = this.registerForm.get('wants_to_volunteer')?.value;

   /* if (this.isVolunteer && selectedVol === false) {
      Swal.fire({
        icon: 'error',
        title: 'Conflict Detected',
        text: 'You selected "No" for volunteering but chose the volunteer role.',
        confirmButtonColor: '#e91e63'
      });
      return;
    }

    if (!this.isVolunteer && selectedVol === true) {
      Swal.fire({
        icon: 'error',
        title: 'Conflict Detected',
        text: 'You said you want to volunteer but did not select the volunteer role.',
        confirmButtonColor: '#e91e63'
      });
      return;
    }*/

    if (this.isVolunteer) {
      this.jobRoleService.getVolunteerFunctions().subscribe(data => {
        this.jobRoles = data;
        this.step = 3;
      });
    } else {
      this.submit();
    }
  }

  if (this.step === 3) {
    if (this.selectedJobRoleIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No volunteer function selected',
        text: 'Please select at least one volunteer task.',
        confirmButtonColor: '#e91e63'
      });
      return;
    }

    this.submit();
  }
}

backStep(): void {
  this.step = 1;
 // const wantsToVolunteer = this.registerForm.get('wants_to_volunteer')?.value;
 // if (wantsToVolunteer === true || wantsToVolunteer === false) {
 //   this.wantsToVolunteerLocked = true;
 // }
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
getSelectedRoleNames(): string[] {
  return this.roles
    .filter(r => this.selectedRoleIds.includes(r.id_role))
    .map(r => r.role_name);
}

loadJobRoles(): void {
  this.jobRoleService.getVolunteerFunctions().subscribe(data => {
    this.jobRoles = data;
  });
}
toggleJobRole(jobId: number): void {
  const index = this.selectedJobRoleIds.indexOf(jobId);
  if (index === -1) {
    this.selectedJobRoleIds.push(jobId);
  } else {
    this.selectedJobRoleIds.splice(index, 1);
  }
}
getInvalidFieldNames(): string[] {
  const fieldLabels: Record<string, string> = {
    name: 'Full Name',
    phone_number: 'Phone Number',
    email: 'Email',
    emergency_contact: 'Emergency Contact',
    username: 'Username',
    password: 'Password',
    age_range: 'Age Range',
    photo_permission: 'Photo Permission',
    community_preference: 'Community Group Preference',
    acknowledged_rules: 'Member Agreement',
    acknowledged_privacy: 'Privacy Policy',
    acknowledged_code_of_conduct: 'Code of Conduct',
    acknowledged_health_safety: 'Health & Safety Manual',
 //   wants_to_volunteer: 'Volunteer Option',
    volunteer_acknowledgement: 'Volunteer Documents'
  };

  const invalidFields: string[] = [];
  Object.keys(this.registerForm.controls).forEach(field => {
    const control = this.registerForm.get(field);
    if (control && control.invalid) {
      invalidFields.push(fieldLabels[field] || field);
    }
  });
  return invalidFields;
}

}
