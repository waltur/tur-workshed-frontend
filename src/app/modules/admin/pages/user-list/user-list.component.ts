import { Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];

    constructor(private http: HttpClient) {}

     ngOnInit(): void {
        this.http.get<any[]>('http://localhost:3000/api/admin/users').subscribe(data => {
          this.users = data;
        });
      }
}
