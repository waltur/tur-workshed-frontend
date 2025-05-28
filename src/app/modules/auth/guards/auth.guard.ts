import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

constructor(private authService: AuthService, private router: Router) {}

 canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Si la ruta comienza con /admin, verificar que tenga rol admin
    if (route.routeConfig?.path === 'admin' || route.parent?.routeConfig?.path === 'admin') {
      if (!this.authService.getUserRoles().includes('Admin')) {
        this.router.navigate(['/']);
        return false;
      }
    }

    return true;
  }

}
