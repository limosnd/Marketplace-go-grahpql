import { Component, signal, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('Marketplace de Carros');
  showUserMenu = false;
  cartCount = 0;
  isUserAuthenticated = false;
  
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly cartService: CartService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    // Inicializar inmediatamente el estado de autenticación
    this.isUserAuthenticated = this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    console.log('App: Initializing...');
    
    // Subscribe to authentication state changes
    const authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
      console.log('App: Authentication state changed to:', isAuth);
      this.isUserAuthenticated = isAuth;
    });
    this.subscriptions.push(authSub);

    // Subscribe to cart changes
    const cartSub = this.cartService.cart$.subscribe(cartItems => {
      this.cartCount = this.cartService.getCartCount();
    });
    this.subscriptions.push(cartSub);
    
    console.log('App: Initial auth state:', this.isUserAuthenticated);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  isAuthenticated(): boolean {
    return this.isUserAuthenticated;
  }

  isOnLoginPage(): boolean {
    return this.router.url === '/login';
  }

  cartItemCount(): number {
    return this.cartCount;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openCart(): void {
    // Navigate to cart page
    this.router.navigate(['/carrito']);
  }
}
