import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarService } from '../services/car.service';
import { Car, CarsResponse, CarFilterInput } from '../interfaces/car.interface';

@Component({
  selector: 'app-car-list',
  imports: [CommonModule],
  templateUrl: './car-list.html',
  styleUrl: './car-list.css'
})
export class CarList implements OnInit {
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

  constructor(private readonly carService: CarService) {}

  ngOnInit() {
    this.loadCars();
    this.checkHealth();
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
