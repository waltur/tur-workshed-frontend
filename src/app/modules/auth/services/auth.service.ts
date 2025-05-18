import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';
    private tokenKey = 'auth_token';

    constructor(private http: HttpClient, private router: Router) {}

 login(email: string, password: string) {

   return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
     tap((res) => {
       localStorage.setItem(this.tokenKey, res.token);

       // Si deseas guardar también los roles (opcionalmente en memoria):
       const payload = JSON.parse(atob(res.token.split('.')[1]));
       console.log('Roles del usuario:', payload.roles); // ['admin', 'staff', etc.]
     })
   );
 }
 getUserRoles(): string[] {
   console.log("getUserRoles");
   const token = localStorage.getItem(this.tokenKey);
   if (!token) return [];
   try {
     const payload = JSON.parse(atob(token.split('.')[1]));
     return payload.roles || [];
   } catch (err) {
     return [];
   }
 }
 getUserInfo(): { username: string; email: string; roles: string[] } | null {
   const token = this.getToken();
   if (!token) return null;
   try {
     const payload = JSON.parse(atob(token.split('.')[1]));
     return {
       username: payload.username,
       email: payload.email,
       roles: payload.roles || []
     };
   } catch {
     return null;
   }
 }

    logout() {
      localStorage.removeItem(this.tokenKey);
      this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
      return !!localStorage.getItem(this.tokenKey);
    }

    getToken(): string | null {
      return localStorage.getItem(this.tokenKey);
    }

    register(username: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, {
      username,
      email,
      password
    });
  }
}
