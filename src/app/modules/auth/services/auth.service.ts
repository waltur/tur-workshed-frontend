import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

interface UserInfo {
  username: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'accessToken';
  private refreshKey = 'refreshToken';

  private userInfoSubject = new BehaviorSubject<UserInfo | null>(null);
  userInfo$ = this.userInfoSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.accessToken);
        localStorage.setItem(this.refreshKey, res.refreshToken);
        this.updateUserInfo();
        const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
        console.log('Roles del usuario:', payload.roles);
      }),
      catchError(err => {
        console.error('Login error', err);
        return throwError(() => err);
      })
    );
  }

  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles || [];
    } catch {
      return [];
    }
  }

  isAdmin(): boolean {
    return this.getUserRoles().includes('Admin');
  }

  getUserInfo(): UserInfo | null {
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

  updateUserInfo() {
    const user = this.getUserInfo();
    this.userInfoSubject.next(user);
  }

  logout(showAlert: boolean = false) {
    console.log("logout");
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    this.updateUserInfo();
      if (showAlert) {
        Swal.fire({
          icon: 'warning',
          title: 'Session expired',
          text: 'Your session has expired. Please log in again.',
          confirmButtonColor: '#d33'
        });
      }
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  checkEmail(email: string) {
    return this.http.get<{ exists: boolean }>(
      `${this.apiUrl}/check-email?email=${encodeURIComponent(email)}`
    );
  }

  checkUsername(username: string) {
    return this.http.get<{ exists: boolean }>(
      `${this.apiUrl}/check-username?username=${encodeURIComponent(username)}`
    );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    const refresh = localStorage.getItem(this.refreshKey);
    return this.http.post<{ accessToken: string }>(
      `${this.apiUrl}/refresh-token`,
      { token: refresh }
    );
  }

  saveAccessToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.updateUserInfo();
  }
}
