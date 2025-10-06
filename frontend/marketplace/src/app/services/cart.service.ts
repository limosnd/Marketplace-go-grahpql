import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Car } from '../interfaces/car.interface';

export interface CartItem {
  car: Car;
  quantity: number;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  private readonly CART_KEY = 'marketplace_cart';

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {
    this.loadCart();
  }

  private loadCart(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.CART_KEY);
      if (saved) {
        try {
          const cartItems = JSON.parse(saved);
          // Convert addedAt back to Date objects
          const cart = cartItems.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }));
          this.cartSubject.next(cart);
        } catch (error) {
          console.error('Error loading cart:', error);
          this.cartSubject.next([]);
        }
      }
    }
  }

  private saveCart(cart: CartItem[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    }
  }

  addToCart(car: Car, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.findIndex(item => item.car.id === car.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const newCart = [...currentCart];
      newCart[existingItemIndex].quantity += quantity;
      this.cartSubject.next(newCart);
      this.saveCart(newCart);
    } else {
      // Add new item
      const newItem: CartItem = {
        car,
        quantity,
        addedAt: new Date()
      };
      const newCart = [...currentCart, newItem];
      this.cartSubject.next(newCart);
      this.saveCart(newCart);
    }
  }

  removeFromCart(carId: string): void {
    const currentCart = this.cartSubject.value;
    const newCart = currentCart.filter(item => item.car.id !== carId);
    this.cartSubject.next(newCart);
    this.saveCart(newCart);
  }

  updateQuantity(carId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(carId);
      return;
    }

    const currentCart = this.cartSubject.value;
    const newCart = currentCart.map(item => 
      item.car.id === carId 
        ? { ...item, quantity }
        : item
    );
    this.cartSubject.next(newCart);
    this.saveCart(newCart);
  }

  clearCart(): void {
    this.cartSubject.next([]);
    this.saveCart([]);
  }

  isInCart(carId: string): boolean {
    return this.cartSubject.value.some(item => item.car.id === carId);
  }

  getCartItems(): CartItem[] {
    return this.cartSubject.value;
  }

  getCartCount(): number {
    return this.cartSubject.value.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cartSubject.value.reduce((total, item) => total + (item.car.price * item.quantity), 0);
  }

  getItemQuantity(carId: string): number {
    const item = this.cartSubject.value.find(item => item.car.id === carId);
    return item ? item.quantity : 0;
  }
}
