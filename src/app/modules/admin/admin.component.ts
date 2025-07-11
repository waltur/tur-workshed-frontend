import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
 constructor(private router: Router) {}

  navigateTo(section: string): void {
    if (section === 'users') {
      this.router.navigate(['/admin/users']);
    }else if (section === 'groups') {
      this.router.navigate(['/groups']);
    }else if (section === 'news') {
           this.router.navigate(['/news/create']);
    }else if (section === 'attendance-report') {
                this.router.navigate(['/admin/attendance-report']);
         }
  }
}
