import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../../services/group.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html'
})
export class GroupFormComponent implements OnInit {
group: any = {
  name: '',
  description: '',
  category:'',
  image: ''
};
  isEdit = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.groupService.getGroup(+id).subscribe(g => this.group = g);
    }
  }
onImageSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.group.image = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
submit(): void {
  Swal.fire({
    title: 'Saving...',
    text: 'Please wait',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  if (this.group.image && typeof this.group.image === 'string') {
    const base64Header = this.group.image.split(',')[0];
    const mimeMatch = base64Header.match(/^data:(image\/(jpeg|png|webp));base64$/);

    if (!mimeMatch) {
      Swal.close(); // 🔴 Cierra el loading antes de mostrar el error
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Only image files (JPEG, PNG, WEBP) are allowed.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const base64Str = this.group.image.split(',')[1];
    const estimatedSizeBytes = (base64Str.length * 3) / 4 - (base64Str.endsWith('==') ? 2 : base64Str.endsWith('=') ? 1 : 0);
    const maxSizeMB = 2;

    if (estimatedSizeBytes > maxSizeMB * 1024 * 1024) {
      Swal.close(); // 🔴 También cerrar el loading aquí
      Swal.fire({
        icon: 'error',
        title: 'Image Too Large',
        text: `Image must be smaller than ${maxSizeMB}MB.`,
        confirmButtonText: 'OK'
      });
      return;
    }
  }

  const request$ = this.isEdit
    ? this.groupService.updateGroup(this.group.id_group, this.group)
    : this.groupService.createGroup(this.group);

  request$.subscribe({
    next: () => {
      Swal.close(); // 🔴 Cerrar spinner antes de mostrar éxito
      Swal.fire({
        icon: 'success',
        title: 'Saved Successfully',
        text: 'Group data has been saved.',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/groups']);
      });
    },
    error: (err) => {
      Swal.close(); // 🔴 Cierra el spinner
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was a problem saving the group.',
        confirmButtonText: 'OK'
      });
      console.error(err);
    }
  });
}
}
