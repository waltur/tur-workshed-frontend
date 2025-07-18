import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap, catchError } from 'rxjs/operators';
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
login(email: string, password: string): Observable<any> {
  return this.http.post<{ accessToken: string; refreshToken: string }>(
    `${this.apiUrl}/login`,
    { email, password }
  ).pipe(
    map((res: { accessToken: string; refreshToken: string }) => {
      localStorage.setItem(this.tokenKey, res.accessToken);
      localStorage.setItem(this.refreshKey, res.refreshToken);
      this.updateUserInfo();

      try {
        const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
        console.log('Roles del usuario:', payload.roles);
      } catch (err) {
        console.warn('Error decoding token:', err);
      }

      return res;
    }),
    catchError(err => {
      console.error('Login error (catchError):', err);
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

 isMember(): boolean {
    return this.getUserRoles().includes('Member');
  }

  getUserInfo(): UserInfo | null {
     console.log("getUserInfo");
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
    console.log("updateUserInfo");
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
    console.log("refreshToken");
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

  hasJobRole(roleName: string): boolean {
    console.log("hasJobRole");
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const jobRoles: string[] = payload.job_roles || []; // asegurarte que el token contenga esto
      return jobRoles.map(r => r.toLowerCase()).includes(roleName.toLowerCase());
    } catch {
      return false;
    }
  }

getContactId(): number | null {
  const token = this.getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.contact_id || null;
  } catch {
    return null;
  }
}
changePassword(currentPassword: string, newPassword: string) {
  console.log("changePassword");
  return this.http.put<{ message: string }>(
    `${this.apiUrl}/change-password`,
    { currentPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(this.tokenKey)}` // o el nombre que uses
      }
    }
  );
}
forgotPassword(email: string) {
  return this.http.post<{ message: string }>(
    `${this.apiUrl}/forgot-password`,
    { email }
  );
}
resetPassword(token: string, newPassword: string) {
  return this.http.post<{ message: string }>(
    `${this.apiUrl}/reset-password`,
    { token, newPassword }
  );
}
resendVerificationEmail(email: string) {
  return this.http.post(`${this.apiUrl}/resend-verification`, { email });
}
verifyEmailToken(token: string) {
  return this.http.get<{ message: string }>(`${this.apiUrl}/verify-email/${token}`);
}
}
