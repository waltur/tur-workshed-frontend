import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { VolunteerService } from '../../services/volunteer.service';
import { PaypalService } from '../../../../services/paypal.service';
import { JobRoleService } from '../../services/job-role.service';
import { Router } from '@angular/router';
import { ImageUploadService } from '../../../../shared/services/image-upload.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

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
memberRoleId: number | null = null;
ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
wantsToVolunteerLocked: boolean = false;
loading:boolean=false;
photoPreview: string | null = null;



paypalRendered = false;
processingPayment = false;
paymentCompleted = false;

paypalOrderId = '';
paypalCaptureId = '';
isMemberSelected = false;

//volunteer

interests: any[] = [];
skills: any[] = [];
certifications: any[] = [];
availability: any[] = [];

selectedAvailability:number[]=[];
availabilityTypes:any[]=[];

selectedVolunteerData = {
  interests: [] as number[],
  skills: [] as number[],
  certifications: [] as number[]
};

registering = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private roleService:RoleService,
    private jobRoleService:JobRoleService,
    private imageUpload: ImageUploadService,
    private paypalService: PaypalService,
    private volunteerService: VolunteerService,
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



     // 🔥 NUEVOS (STEP 4)
     confirm_age: [false, Validators.requiredTrue],
     accept_membership_policy: [false, Validators.requiredTrue],
     accept_consent: [false, Validators.requiredTrue],
     accept_privacy_full: [false, Validators.requiredTrue],
     accept_code_full: [false, Validators.requiredTrue],
     accept_health_full: [false, Validators.requiredTrue],
     final_acknowledgement: [false, Validators.requiredTrue],
     wants_to_volunteer: [false],
     volunteer_acknowledgement: [false],

     // STEP 5
    occupation: [''],
    organisation: [''],
    languages: [''],
    own_vehicle: [false],
    medical_conditions: [''],
    volunteer_experience: [''],
    emergency_notes: [''],
    additional_information: [''],

   });

   this.isAdmin = this.authService.isAdmin();
   this.loadVolunteerCatalogs();
   this.roleService.getRoles().subscribe({
     next: (data) => {
       this.roles = data;
       const volunteerRole = this.roles.find(role => role.role_name.toLowerCase() === 'volunteer');
              this.volunteerRoleId = volunteerRole ? volunteerRole.id_role : null;
       const memberRole = this.roles.find(role => role.role_name.toLowerCase() === 'participant(member)');
              this.memberRoleId = memberRole ? memberRole.id_role : null;

     },
     error: () => {
       this.registerError = 'Failed to load roles from server.';
     }
   });
 }
togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}


loadPaypalButtons(): void {

  // Evita renderizar más de una vez

  const paypal = (window as any).paypal;

  if (!paypal) {
    console.error('PayPal SDK not loaded');
    return;
  }

  const container = document.getElementById('paypal-button-container');

  if (!container) {
    console.error('paypal-button-container not found');
    return;
  }


  container.innerHTML = '';

  paypal.Buttons({

    createOrder: async () => {

      const response = await firstValueFrom(
        this.paypalService.createOrder(1)
      );

      return response.id;
    },

    onApprove: async (data: any) => {

      try {

        this.processingPayment = true;

        const result = await firstValueFrom(
          this.paypalService.captureOrder(data.orderID)
        );

        this.paypalOrderId = result.orderID;
        this.paypalCaptureId = result.captureID;

        this.paymentCompleted = true;
        this.processingPayment = false;

        Swal.fire({
          icon: 'success',
          title: 'Payment successful',
          text: 'Membership activated',
          confirmButtonColor: '#e91e63'
        });

      } catch (error) {

        this.processingPayment = false;

        Swal.fire({
          icon: 'error',
          title: 'Payment failed',
          text: 'Unable to verify payment.',
          confirmButtonColor: '#e91e63'
        });

      }

    },

    onCancel: () => {

      Swal.fire({
        icon: 'info',
        title: 'Payment cancelled'
      });

    },

    onError: (err: any) => {

      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'PayPal Error',
        text: 'An unexpected error occurred.',
        confirmButtonColor: '#e91e63'
      });

    }

  }).render('#paypal-button-container')
    .then(() => {

      console.log('PayPal Buttons Rendered');

    });

}
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
const invalidFields = Object.keys(this.registerForm.controls)
    .filter(key => this.registerForm.get(key)?.invalid);

if (invalidFields.length > 0) {

    this.registerForm.markAllAsTouched();

    Swal.fire({

        icon: 'warning',

        title: 'Please complete the form',

        html: `
            There are <b>${invalidFields.length}</b> required fields missing.
        `,

        confirmButtonColor: '#ea580c'

    });

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
  const isMember = this.selectedRoleIds.includes(this.memberRoleId!);
  const formData = {
    ...this.registerForm.value,
    roles: this.selectedRoleIds,
    job_roles: this.selectedJobRoleIds,
    paypal_order_id: this.paypalOrderId,
    paypal_capture_id: this.paypalCaptureId,
    interests: this.selectedVolunteerData.interests,
    skills: this.selectedVolunteerData.skills,
    certifications: this.selectedVolunteerData.certifications,

  };

  this.loading = true;

  Swal.fire({

      title: 'Creating your account...',

      html: 'Please wait a moment.',

      allowOutsideClick: false,

      allowEscapeKey: false,

      didOpen: () => {

          Swal.showLoading();

      }

  });
  console.log(formData);
  this.authService.register(formData).subscribe({
    next: () => {
      this.loading = false; // ✅ Finaliza loading
      Swal.close();
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
      Swal.close();
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
 this.isMemberSelected=false;
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
 // ✅ STEP 4 (VALIDACIÓN FINAL)

 if (this.step === 4) {

     this.registerForm.updateValueAndValidity();

     const isMember =
         this.selectedRoleIds.includes(this.memberRoleId!);

     this.isMemberSelected = isMember;

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

             icon:'warning',

             title:'Incomplete confirmation',

             text:'You must accept all policies to continue.',

             confirmButtonColor:'#e91e63'

         });

         this.markFieldsAsTouched(step4Fields);

         return;

     }

     //---------------------------------------
     // NEW VOLUNTEER STEP
     //---------------------------------------

     if(this.isVolunteer){

         this.step = 5;

         return;

     }

     //---------------------------------------
     // NON VOLUNTEERS
     //---------------------------------------

     if(isMember){

         this.step = 6;

         setTimeout(()=>{

             this.loadPaypalButtons();

         });

     }else{

         this.submit();

     }

 }
 if(this.step==5){

     const isMember =
         this.selectedRoleIds.includes(this.memberRoleId!);

       if (this.selectedVolunteerData.interests.length === 0) {

         Swal.fire({

           icon: 'warning',

           title: 'Select an area of interest',

           text: 'Please choose at least one area where you would like to volunteer.'

         });

         return;

       }

     if(isMember){

         this.step=6;

         setTimeout(()=>{

             this.loadPaypalButtons();

         });

     }else{

         this.submit();

     }

     return;

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
  const publicRoles = ['volunteer', 'participant(member)'];
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
loadVolunteerCatalogs(): void {
console.log("loadVolunteerCatalogs");
    this.volunteerService.getCatalogs()

    .subscribe({

        next:(response)=>{

            this.interests=response.interests;

            this.skills=response.skills;

            this.certifications=response.certifications;

            this.availability=response.availability;

        },

        error:(err)=>{

            console.error(err);

        }

    });

}






toggleSelection(
  type: 'interests' | 'skills' | 'certifications',
  id: number
): void {

  const list = this.selectedVolunteerData[type];

  const index = list.indexOf(id);

  if (index >= 0) {

    list.splice(index, 1);

  } else {

    list.push(id);

  }

}
get nextButtonText(): string {

  const isMember = this.selectedRoleIds.includes(this.memberRoleId!);
  const isVolunteer = this.selectedRoleIds.includes(this.volunteerRoleId!);

  switch (this.step) {

    case 1:
    case 2:
    case 3:
      return 'Continue';

    case 4:

      if (isVolunteer) {
        return 'Continue';
      }

      if (isMember) {
        return 'Continue with Payment';
      }

      return 'Finish Registration';

    case 5:

      // Si el paso 5 es el cuestionario del voluntario

      if (isMember) {
        return 'Continue with Payment';
      }

      return 'Finish Registration';

    case 6:
      return 'Pay Membership';

    default:
      return 'Continue';
  }
}

}
