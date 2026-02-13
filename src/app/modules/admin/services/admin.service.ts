import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
    private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
       map(users => users.map(user => ({
         ...user,
         is_active: user.is_active === '1' // 🔁 convierte string a boolean
       })))
     );
  }
  deactivateUser(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/deactivate`, {});
  }
  activateUser(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/activate`, {});
  }
  notVerifiedMail(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/notVerifiedMail`, {});
  }
  verifiedMail(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/verifiedMail`, {});
  }
    getUserById(id: number): Observable<any> {
      return this.http.get(`${this.apiUrl}/users/${id}`);
    }

    createUser(data: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/users`, data);
    }

    updateUser(id: number, data: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/users/${id}`, data);
    }

}
