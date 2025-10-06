import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    const targetUrl = state.url;
    
    console.log('AuthGuard: Checking access to:', targetUrl, 'isAuthenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('AuthGuard: Access granted to:', targetUrl);
      return true;
    } else {
      console.log('AuthGuard: Access denied, redirecting to login from:', targetUrl);
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: targetUrl }
      });
      return false;
    }
  }
}
