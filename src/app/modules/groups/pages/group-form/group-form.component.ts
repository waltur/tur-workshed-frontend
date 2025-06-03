import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../../services/group.service';

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
    if (this.isEdit) {
      this.groupService.updateGroup(this.group.id_group, this.group).subscribe(() => {
        this.router.navigate(['/groups']);
      });
    } else {
      this.groupService.createGroup(this.group).subscribe(() => {
        this.router.navigate(['/groups']);
      });
    }
  }
}
