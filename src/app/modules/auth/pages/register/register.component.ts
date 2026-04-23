import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { JobRoleService } from '../../services/job-role.service';
import { Router } from '@angular/router';
import { ImageUploadService } from '../../../../shared/services/image-upload.service';
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
photoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private roleService:RoleService,
    private jobRoleService:JobRoleService,
    private imageUpload: ImageUploadService
  ) {}

 ngOnInit(): void {
   this.registerForm = this.fb.group({
     name: ['', Validators.required],
     phone_number: ['', [Validators.required, this.validatePhone]],
     email: ['', [Validators.required, Validators.email]],
     emergency_contact: ['', [this.validatePhone]],
     username: ['', Validators.required],
     password: ['', Validators.required],

     age_range: ['', Validators.required],
     photo_permission: [false, Validators.required],
     community_preference: ['', Validators.required],
     photo_url: [null],

     // ✅ YA TENÍAS
     /*acknowledged_rules: [false, Validators.requiredTrue],
     acknowledged_privacy: [false, Validators.requiredTrue],
     acknowledged_code_of_conduct: [false, Validators.requiredTrue],
     acknowledged_health_safety: [false, Validators.requiredTrue],*/

     // 🔥 NUEVOS (STEP 4)
     confirm_age: [false, Validators.requiredTrue],
     accept_membership_policy: [false, Validators.requiredTrue],
     accept_consent: [false, Validators.requiredTrue],
     accept_privacy_full: [false, Validators.requiredTrue],
     accept_code_full: [false, Validators.requiredTrue],
     accept_health_full: [false, Validators.requiredTrue],
     final_acknowledgement: [false, Validators.requiredTrue],

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
 }
togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}
/*onPhotoSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    this.photoPreview = reader.result as string;
    this.photoBase64 = this.photoPreview;  // ya en formato base64 para backend
  };
  reader.readAsDataURL(file);
}
*/
validatePhone(control: any) {
  const value = control.value;

  // Permitir vacío (solo en emergency_contact)
  if (!value) return null;

  // Debe comenzar con + y tener solo números después
  const phoneRegex = /^\+\d{8,15}$/;

  return phoneRegex.test(value) ? null : { invalidPhone: true };
}
submit(): void {
  console.log('FORM VALUE BEFORE SUBMIT', this.registerForm.value);
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

  // ✅ STEP 1
  if (this.step === 1) {

    const step1Fields = [
      'name',
      'phone_number',
      'email',
      'emergency_contact',
      'username',
      'password',
      'age_range',
      'photo_permission',
      'community_preference'

    ];

    const invalidFields = step1Fields.filter(field => {
      const control = this.registerForm.get(field);
      return control && control.invalid;
    });

    if (invalidFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete form',
        html: `Please complete:<br><strong>${invalidFields.join(', ')}</strong>`,
        confirmButtonColor: '#e91e63'
      });

      this.markFieldsAsTouched(step1Fields);
      return;
    }

    this.step = 2;
    return;
  }

  // ✅ STEP 2
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

    if (this.isVolunteer) {
      this.jobRoleService.getVolunteerFunctions().subscribe(data => {
        this.jobRoles = data;
        this.step = 3;
      });
    } else {
      this.step = 4;
    }
    return;
  }

  // ✅ STEP 3
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

    this.step = 4;
    return;
  }

  // ✅ STEP 4 (VALIDACIÓN FINAL)
 if (this.step === 4) {

   this.registerForm.updateValueAndValidity();

   const step4Fields = [
     'confirm_age',
     'accept_membership_policy',
     'accept_consent',
     'accept_privacy_full',
     'accept_code_full',
     'accept_health_full',
     'final_acknowledgement'
   ];

   const invalidFields = step4Fields.filter(field => {
     const control = this.registerForm.get(field);
     return control && control.invalid;
   });

   if (invalidFields.length > 0) {
     Swal.fire({
       icon: 'warning',
       title: 'Incomplete confirmation',
       text: 'You must accept all policies to continue.',
       confirmButtonColor: '#e91e63'
     });

     this.markFieldsAsTouched(step4Fields);
     return;
   }

   this.submit();
 }
}
markFieldsAsTouched(fields: string[]) {
  fields.forEach(field => {
    this.registerForm.get(field)?.markAsTouched();
  });
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

async onPhotoSelected(event: any) {
  const file: File = event.target.files[0];
  if (!file) return;

  const url = await this.imageUpload.uploadImage(file, 'profiles');
  console.log('SUPABASE URL:', url);
  if (url) {
    this.photoPreview = url;              // 👈 mostrar preview
    this.registerForm.patchValue({
      photo_url: url
    });
  }
}

}
