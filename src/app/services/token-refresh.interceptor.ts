import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../modules/auth/services/auth.service';


@Injectable()
export class TokenRefreshInterceptor implements HttpInterceptor {

 private isRefreshing = false;
   private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

   constructor(private authService: AuthService) {}

   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     const token = this.authService.getToken();
     const authReq = token ? this.addToken(req, token) : req;
      if (req.url.includes('/auth/refresh')) {
        this.authService.logout(true);
        return throwError(() => new Error('Refresh token expired'));
      }
           return next.handle(authReq).pipe(
       catchError(error => {
        if (
          error instanceof HttpErrorResponse &&
          (error.status === 401 || error.status === 403)
        ) {
          return this.handleAuthError(req, next, error.status);
        }
         return throwError(() => error);
       })
     );
   }
 private handleAuthError(
   req: HttpRequest<any>,
   next: HttpHandler,
   status: number
 ) {
   // 403 = token válido pero sin permisos → logout directo
   if (status === 403) {
     this.authService.logout(true);
     return throwError(() => new Error('Session expired'));
   }

   // 401 = token expirado → intentar refresh
   return this.handle401Error(req, next);
 }


   private addToken(req: HttpRequest<any>, token: string) {
     return req.clone({
       setHeaders: {
         Authorization: `Bearer ${token}`
       }
     });
   }

   private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
     if (!this.isRefreshing) {
       this.isRefreshing = true;
       this.refreshTokenSubject.next(null);

       return this.authService.refreshToken().pipe(
         switchMap((res: any) => {
           this.isRefreshing = false;
           this.authService.saveAccessToken(res.accessToken); // guarda el nuevo
           this.refreshTokenSubject.next(res.accessToken);
           return next.handle(this.addToken(req, res.accessToken));
         }),
         catchError((err) => {
           this.isRefreshing = false;
           this.authService.logout(true); // cerrar sesión si falla
           return throwError(() => err);
         })
       );
     } else {
       return this.refreshTokenSubject.pipe(
         filter(token => token != null),
         take(1),
         switchMap(token => next.handle(this.addToken(req, token!)))
       );
     }
   }
}
