import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    // Initialize authentication state from localStorage if in browser
    if (isPlatformBrowser(this.platformId)) {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');
      
      // Solo establecer como autenticado si todos los datos están presentes
      if (isAuth && userEmail && userName) {
        console.log('Auth: Restoring authentication for:', userEmail);
        this.isAuthenticatedSubject.next(true);
      } else {
        console.log('Auth: No valid session found, clearing data');
        this.clearLocalStorage();
        this.isAuthenticatedSubject.next(false);
      }
    }
  }

  private clearLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
    }
  }

  login(email: string, password: string): boolean {
    // Implement basic validation for demo purposes
    // In production, this would call GraphQL login mutation
    if (email && password && email.includes('@') && password.length >= 3) {
      console.log('Auth: Login successful for:', email);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', email.split('@')[0]);
      }
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    console.log('Auth: Login failed for:', email);
    return false;
  }

  register(name: string, email: string, password: string): boolean {
    // Implement basic validation for demo purposes
    // In production, this would call GraphQL register mutation
    if (name && email && password && email.includes('@') && password.length >= 6) {
      console.log('Auth: Registration successful for:', email);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);
      }
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    console.log('Auth: Registration failed for:', email);
    return false;
  }

  logout(): void {
    console.log('Auth: Logging out user');
    this.clearLocalStorage();
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getUserName(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('userName') || '';
    }
    return '';
  }

  getUserEmail(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('userEmail') || '';
    }
    return '';
  }
}
