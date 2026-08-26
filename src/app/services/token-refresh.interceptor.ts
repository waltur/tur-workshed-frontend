import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Injectable
} from '@angular/core';

import {
  Observable,
  throwError,
  BehaviorSubject
} from 'rxjs';

import {
  catchError,
  filter,
  switchMap,
  take
} from 'rxjs/operators';

import {
  AuthService
} from '../modules/auth/services/auth.service';


@Injectable()
export class TokenRefreshInterceptor
implements HttpInterceptor {

  private isRefreshing = false;

  private refreshTokenSubject =
    new BehaviorSubject<string | null>(
      null
    );

  constructor(
    private authService: AuthService
  ) {}


  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();

    console.log('========== HTTP INTERCEPTOR ==========');
    console.log('URL:', req.url);
    console.log('TOKEN EXISTS:', !!token);

    const authReq = token
      ? this.addToken(req, token)
      : req;

    console.log(
      'AUTH HEADER:',
      authReq.headers.get('Authorization')
    );

    return next.handle(authReq).pipe(

      catchError(error => {

        if (req.url.includes('/auth/refresh-token')) {

          this.authService.logout(true);

          return throwError(() => error);

        }

        if (
          error instanceof HttpErrorResponse &&
          (error.status === 401 || error.status === 403)
        ) {

          return this.handle401Error(
            req,
            next
          );

        }

        return throwError(() => error);

      })

    );

  }

  private addToken(
    req: HttpRequest<any>,
    token: string
  ) {

    return req.clone({

      setHeaders: {

        Authorization:
          `Bearer ${token}`

      }

    });

  }


  private handle401Error(
    req: HttpRequest<any>,
    next: HttpHandler
  ) {

    if (!this.isRefreshing) {

      this.isRefreshing = true;

      this.refreshTokenSubject.next(
        null
      );


      return this.authService
        .refreshToken()
        .pipe(

          switchMap(
            (res: any) => {

              this.isRefreshing = false;

              this.authService.saveAccessToken(
                res.accessToken
              );

              this.refreshTokenSubject.next(
                res.accessToken
              );


              return next.handle(

                this.addToken(
                  req,
                  res.accessToken
                )

              );

            }
          ),


          catchError(err => {

            this.isRefreshing = false;

            this.authService.logout(true);

            return throwError(
              () => err
            );

          })

        );

    }


    // Si ya existe un refresh en proceso,
    // esperar al nuevo token

    return this.refreshTokenSubject.pipe(

      filter(
        token => token != null
      ),

      take(1),

      switchMap(
        token =>

          next.handle(

            this.addToken(
              req,
              token!
            )

          )

      )

    );

  }

}
