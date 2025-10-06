import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice = 0;
  loading = false;

  constructor(
    private readonly cartService: CartService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    
    // Subscribe to cart changes
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.calculateTotal();
  }

  updateQuantity(carId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(carId);
    } else {
      this.cartService.updateQuantity(carId, quantity);
    }
  }

  removeFromCart(carId: string): void {
    this.cartService.removeFromCart(carId);
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.cartService.clearCart();
    }
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // For now, just show a summary
    const summary = this.cartItems.map(item => 
      `${item.car.title} - Cantidad: ${item.quantity} - ${this.formatPrice(item.car.price * item.quantity)}`
    ).join('\n');

    alert(`Resumen de compra:\n\n${summary}\n\nTotal: ${this.formatPrice(this.totalPrice)}\n\nProceso de pago próximamente...`);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  formatMileage(mileage: number): string {
    return new Intl.NumberFormat('es-ES').format(mileage) + ' km';
  }

  private calculateTotal(): void {
    this.totalPrice = this.cartService.getTotalPrice();
  }
}
