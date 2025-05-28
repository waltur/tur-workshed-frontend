import { Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filter: 'all' | 'active' | 'inactive' = 'all';

    constructor(private adminService: AdminService) {}

     ngOnInit(): void {
         this.adminService.getUsers().subscribe(data => {
              this.users = data;
            });
      }

  deactivate(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This user will be deactivated.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, deactivate',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deactivateUser(id).subscribe({
          next: () => {
            this.users = this.users.map(user =>
              user.id_user === id ? { ...user, is_active: false } : user
            );
            Swal.fire('Deactivated', 'The user has been deactivated.', 'success');
          },
          error: () => Swal.fire('Error', 'Failed to deactivate user.', 'error')
        });
      }
    });
  }
 activate(id: number): void {
   Swal.fire({
     title: 'Activate user?',
     icon: 'question',
     showCancelButton: true,
     confirmButtonText: 'Yes, activate'
   }).then(result => {
     if (result.isConfirmed) {
       this.adminService.activateUser(id).subscribe({
         next: () => {
           this.users = this.users.map(user =>
             user.id_user === id ? { ...user, is_active: true } : user
           );
           Swal.fire('Activated', 'The user is now active.', 'success');
         },
         error: () => Swal.fire('Error', 'Could not activate user.', 'error')
       });
     }
   });
 }
  get filteredUsers(): any[] {
    console.log("filteredUsers");
    if (this.filter === 'active') {
      return this.users.filter(user => user.is_active);
    } else if (this.filter === 'inactive') {
      return this.users.filter(user => !user.is_active);
    }
    return this.users;
  }
}
