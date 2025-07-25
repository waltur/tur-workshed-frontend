import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../../auth/services/auth.service';
import { RoleService } from '../../../auth/services/role.service';
import { JobRoleService } from '../../../auth/services/job-role.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
userForm!: FormGroup;
  mode: 'create' | 'edit' = 'create';
  userId!: number;
  roles: { id_role: number; role_name: string }[] = [];
  selectedRoles: number[] = [];
  jobRoles: any[] = [];
  roleMap: { [id: number]: string } = {};
  user: any = {
    username: '',
    email: '',
    name: '',
    phone_number:'',
    roles: [],
    job_roles: [],
    emergency_contact: '',
    photo: [''], // base64
  };
loadingUser: boolean = false;
photoPreview: string | null = null;
photoBase64: string | null = null;
mediaUrl = environment.mediaUrl;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private authService: AuthService,
    private roleService: RoleService,
    private jobRoleService:JobRoleService,
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    this.initForm();
    this.loadRoles().then(() => {
       if (this.mode === 'edit') {
         this.loadUser(this.userId);
       }
     });

    if (this.userId) {
      this.mode = 'edit';
      this.loadUser(this.userId);
    }

    this.jobRoleService.getVolunteerFunctions().subscribe(data => {
          this.jobRoles = data;

        });
      if (this.user && Array.isArray(this.user.roles)) {
        this.selectedRoles = [...this.user.roles]; // 🔄 Clonamos los IDs para checkbox
      }
  }
onPhotoSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    this.photoBase64 = reader.result as string;
    this.photoPreview = this.photoBase64;
  };
  reader.readAsDataURL(file); // convierte a base64
}
  initForm(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['',[Validators.required]], // solo requerido en "create"
      phone_number: ['',Validators.required],
      emergency_contact:[''],
    });
  }

loadRoles(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.roleService.getRoles().subscribe({
      next: roles => {
        this.roles = roles;
        this.roleMap = {};
        for (const role of roles) {
          this.roleMap[role.id_role] = role.role_name.toLowerCase();
        }
        resolve(); // ✅ Ya tenemos los roles
      },
      error: err => {
        Swal.fire('Error', 'Failed to load roles', 'error');
        reject(err);
      }
    });
  });
}
loadUser(id: number): void {
  console.log("load User");
  this.loadingUser = true;
  this.adminService.getUserById(id).subscribe({
    next: user => {
      // ✅ Cargamos el formulario reactivo
      this.userForm.patchValue({
        username: user.username,
        email: user.email,
        name: user.name,
        phone_number:user.phone_number,
        emergency_contact:user.emergency_contact,
        photo_url: user.photo_url || null

      });

      // ✅ Llenamos la variable this.user (completa)
      this.user = {
        username: user.username,
        email: user.email,
        roles: [],
        job_roles: user.job_roles || [],
        photo_url: user.photo_url || null
      };

      // ✅ Convertimos los nombres de roles a sus IDs
      this.selectedRoles = user.roles.map((r: string) => {
        const found = this.roles.find(role => role.role_name.toLowerCase() === r.toLowerCase());
        return found ? found.id_role : null;
      }).filter((id:number): id is number => id !== null); // elimina nulos

      // ✅ Sincronizamos user.roles con selectedRoles
      this.user.roles = [...this.selectedRoles];

      // ✅ Limpiar funciones voluntarias si no aplica
      const isVolunteer = this.selectedRoles.some(roleId => this.roleMap[roleId] === 'volunteer');
      if (!isVolunteer) {
        this.user.job_roles = [];
      }
     this.loadingUser = false;
    },
    error: () => {Swal.fire('Error', 'User not found', 'error');
     this.loadingUser = false;
     }
  });
}

toggleRole(roleId: number): void {
  const selectedIndex = this.selectedRoles.indexOf(roleId);
  const userIndex = this.user.roles.indexOf(roleId);

  if (selectedIndex > -1) {
    // 🔴 Se está desmarcando el rol
    this.selectedRoles.splice(selectedIndex, 1);
    if (userIndex > -1) {
      this.user.roles.splice(userIndex, 1);
    }

    // 🧹 Si el rol era "volunteer", limpiamos funciones voluntarias
    if (this.roleMap[roleId] === 'volunteer') {
      this.user.job_roles = [];
    }
  } else {
    // 🟢 Se está marcando el rol
    this.selectedRoles.push(roleId);
    if (userIndex === -1) {
      this.user.roles.push(roleId);
    }
  }

  // 🔄 Si ya no tiene "volunteer", también limpiamos por seguridad
  if (!this.isVolunteerSelected()) {
    this.user.job_roles = [];
  }
}

submit(): void {
  this.user.roles = [...this.selectedRoles];

  if (!this.isFormValid()) {
    Swal.fire({
      icon: 'warning',
      title: 'Incomplete Form',
      text: 'Please fill in all required fields. If volunteer is selected, at least one function must be selected.',
    });
    return;
  }

  const data = {
    ...this.userForm.value,
    email: this.userForm.value.email?.toLowerCase(),
    roles: this.selectedRoles,
    job_roles: this.user.job_roles || [],
    emergency_contact:this.userForm.value.emergency_contact,
    photoBase64: this.photoBase64 || null
  };

  if (this.mode === 'create') {
    if (!data.password) {
      Swal.fire('Warning', 'Password is required to create user', 'warning');
      return;
    }
    this.adminService.createUser(data).subscribe({
      next: () => {
        Swal.fire('Success', 'User created successfully', 'success').then(() =>
          this.router.navigate(['/admin/users'])
        );
      },
      error: () => Swal.fire('Error', 'Failed to create user', 'error')
    });
  } else {
    delete data.password; // No cambiar contraseña en edición
    this.adminService.updateUser(this.userId, data).subscribe({
      next: () => {
        Swal.fire('Success', 'User updated successfully', 'success').then(() =>
          this.router.navigate(['/admin/users'])
        );
      },
      error: () => Swal.fire('Error', 'Failed to update user', 'error')
    });
  }
}

isVolunteerSelected(): boolean {
  return this.user.roles?.some((roleId: string | number) => {
    if (typeof roleId === 'string') {
      return roleId.toLowerCase() === 'volunteer';
    } else if (typeof roleId === 'number') {
      return this.roleMap[roleId] === 'volunteer';
    }
    return false;
  }) ?? false;
}
  toggleJobRole(jobId: number): void {
    console.log("toggleJobRole");
    const index = this.user.job_roles.indexOf(jobId);
    if (index > -1) {
      this.user.job_roles.splice(index, 1);
    } else {
      this.user.job_roles.push(jobId);
    }
  }
isFormValid(): boolean {
  // Validar campos obligatorios
  const { username, email, phone_number } = this.userForm.value;
  if (!username || !email || !phone_number) {
    return false;
  }

  // Validar que haya al menos un rol
  if (this.selectedRoles.length === 0) {
    return false;
  }


  // Validar que si se selecciona "volunteer", al menos tenga un job_role
  const isVolunteer = this.selectedRoles.some(roleId => this.roleMap[roleId] === 'volunteer');
  if (isVolunteer && (!this.user.job_roles || this.user.job_roles.length === 0)) {
    return false;
  }

  return true;
}
getPhotoUrl(filename?: string): string {
  console.log("getPhotoUrl", filename);
  return filename
    ? `${this.mediaUrl}${filename.replace('/public', '')}`
    : 'assets/images/default-profile.png';
}
}
