import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CarService } from '../services/car.service';
import { FavoritesService } from '../services/favorites.service';
import { CartService } from '../services/cart.service';
import { Car, CarsResponse, CarFilterInput } from '../interfaces/car.interface';

@Component({
  selector: 'app-car-list',
  imports: [CommonModule],
  templateUrl: './car-list.html',
  styleUrl: './car-list.css'
})
export class CarList implements OnInit, OnDestroy {
  cars: Car[] = [];
  filteredCars: Car[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  searchTerm = '';
  selectedBrand = '';
  brands: string[] = [];
  
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly carService: CarService,
    private readonly favoritesService: FavoritesService,
    private readonly cartService: CartService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.loadCars();
    this.checkHealth();
    this.setupCarEventListeners();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupCarEventListeners() {
    // Listen for car created events
    const carCreatedSub = this.carService.carCreated$.subscribe(() => {
      console.log('New car created, refreshing list...');
      this.loadCars();
    });
    this.subscriptions.push(carCreatedSub);

    // Listen for car updated events
    const carUpdatedSub = this.carService.carUpdated$.subscribe(() => {
      console.log('Car updated, refreshing list...');
      this.loadCars();
    });
    this.subscriptions.push(carUpdatedSub);

    // Listen for car deleted events
    const carDeletedSub = this.carService.carDeleted$.subscribe((deletedId) => {
      console.log('Car deleted, refreshing list...');
      this.cars = this.cars.filter(car => car.id !== deletedId);
      this.updateFilteredCars();
    });
    this.subscriptions.push(carDeletedSub);
  }

  loadCars(filter?: CarFilterInput, page: number = 1) {
    this.loading = true;
    this.error = null;
    
    this.carService.getCars(filter, page, 10).subscribe({
      next: (response: CarsResponse) => {
        this.cars = response.cars;
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.total = response.total;
        this.updateFilteredCars();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading cars: ' + err.message;
        this.loading = false;
        console.error('Error loading cars:', err);
      }
    });
  }

  checkHealth() {
    this.carService.healthCheck().subscribe({
      next: (health) => {
        console.log('Backend health:', health);
      },
      error: (err) => {
        console.error('Backend health check failed:', err);
      }
    });
  }

  searchCars(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilters();
  }

  filterByBrand(brand: string) {
    this.selectedBrand = brand;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedBrand = '';
    this.applyFilters();
  }

  loadMoreCars() {
    if (this.currentPage < this.totalPages) {
      this.loadCars(undefined, this.currentPage + 1);
    }
  }

  formatPrice(price: number): string {
    return this.carService.formatPrice(price);
  }

  formatMileage(mileage: number): string {
    return this.carService.formatMileage(mileage);
  }

  getFuelTypeLabel(fuelType: string): string {
    return this.carService.getFuelTypeLabel(fuelType);
  }

  getTransmissionLabel(transmission: string): string {
    return this.carService.getTransmissionLabel(transmission);
  }

  getStatusLabel(status: string): string {
    return this.carService.getStatusLabel(status);
  }

  // Favorites functionality
  toggleFavorite(car: Car): void {
    const wasFavorite = this.favoritesService.toggleFavorite(car);
    // You could add a toast notification here
    console.log(wasFavorite ? 'Added to favorites' : 'Removed from favorites');
  }

  isFavorite(carId: string): boolean {
    return this.favoritesService.isFavorite(carId);
  }

  // Cart functionality
  addToCart(car: Car): void {
    this.cartService.addToCart(car);
    console.log('Added to cart:', car.title);
    // You could add a toast notification here
  }

  isInCart(carId: string): boolean {
    return this.cartService.isInCart(carId);
  }

  getCartQuantity(carId: string): number {
    return this.cartService.getItemQuantity(carId);
  }

  // Contact functionality
  contactSeller(car: Car): void {
    const message = `Hola, estoy interesado en tu ${car.brand} ${car.model} ${car.year}. ¿Podríamos hablar?`;
    const phoneNumber = car.seller.phone?.replace(/\D/g, ''); // Remove non-numeric characters
    
    if (phoneNumber) {
      // Open WhatsApp if phone is available
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      // Fallback to email
      const subject = `Interés en ${car.title}`;
      const emailUrl = `mailto:${car.seller.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      window.open(emailUrl, '_blank');
    }
  }

  // View details functionality
  viewCarDetails(car: Car): void {
    // For now, just show an alert with car details
    // In a real app, you'd navigate to a detail page
    alert(`Detalles del ${car.title}:\n\nPrecio: ${this.formatPrice(car.price)}\nAño: ${car.year}\nKilometraje: ${this.formatMileage(car.mileage)}\nUbicación: ${car.location.city}, ${car.location.state}\n\nDescripción: ${car.description || 'No disponible'}\n\nVendedor: ${car.seller.name}\nTeléfono: ${car.seller.phone || 'No disponible'}\nEmail: ${car.seller.email}`);
  }

  private applyFilters(): void {
    let filtered = [...this.cars];
    
    // Aplicar filtro de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(car => 
        car.title.toLowerCase().includes(term) ||
        car.brand.toLowerCase().includes(term) ||
        car.model.toLowerCase().includes(term) ||
        car.color.toLowerCase().includes(term) ||
        car.description?.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de marca
    if (this.selectedBrand && this.selectedBrand !== 'Todas') {
      filtered = filtered.filter(car => car.brand === this.selectedBrand);
    }
    
    this.filteredCars = filtered;
  }

  private updateFilteredCars(): void {
    this.filteredCars = [...this.cars];
    this.brands = [...new Set(this.cars.map(car => car.brand))].sort((a, b) => a.localeCompare(b));
    this.applyFilters();
  }
}
