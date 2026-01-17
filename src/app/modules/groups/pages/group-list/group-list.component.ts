import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../services/group.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html'
})
export class GroupListComponent implements OnInit {
  groups: any[] = [];

  constructor(private groupService: GroupService) {}

  ngOnInit(): void {
    console.log("grupo list");
    this.groupService.getGroups().subscribe(data => this.groups = data);
       console.log("this.groups",this.groups);
  }
 onDeleteGroup(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This group will be deleted permanently',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.groupService.deleteGroup(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The group has been deleted.', 'success');
            this.loadGroups(); // vuelve a cargar la lista
          },
          error: () => {
            Swal.fire('Error', 'Could not delete the group', 'error');
          }
        });
      }
    });
  }
 loadGroups() {
    // tu método para recargar la tabla
    this.groupService.getGroups().subscribe(data => this.groups = data);
           console.log("this.groups",this.groups);
  }
}
