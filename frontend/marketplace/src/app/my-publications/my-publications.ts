import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CarService } from '../services/car.service';
import { AuthService } from '../services/auth.service';
import { Car, CarsResponse } from '../interfaces/car.interface';

@Component({
  selector: 'app-my-publications',
  imports: [CommonModule],
  templateUrl: './my-publications.html',
  styleUrl: './my-publications.css'
})
export class MyPublications implements OnInit {
  cars: Car[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  currentUserEmail = '';

  constructor(
    private readonly carService: CarService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.currentUserEmail = this.authService.getUserEmail();
    console.log('=== MIS PUBLICACIONES DEBUG ===');
    console.log('Current user email:', this.currentUserEmail);
    console.log('Is authenticated:', this.authService.isAuthenticated());
    this.loadMyCars();
  }

  loadMyCars(page: number = 1) {
    this.loading = true;
    this.error = null;
    
    if (!this.currentUserEmail) {
      this.error = 'No se pudo obtener el email del usuario actual';
      this.loading = false;
      return;
    }
    
    console.log(`Buscando carros para el email: "${this.currentUserEmail}"`);
    
    this.carService.getCarsByUserEmail(this.currentUserEmail, page, 10).subscribe({
      next: (response: CarsResponse) => {
        console.log('Response recibida:', response);
        console.log(`Total de carros encontrados: ${response.total}`);
        
        if (response.cars.length > 0) {
          console.log('Emails de los carros encontrados:');
          response.cars.forEach((car, index) => {
            console.log(`${index + 1}. "${car.seller.email}" (título: ${car.title})`);
          });
        }
        
        this.cars = response.cars;
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.total = response.total;
        this.loading = false;
        
        console.log(`Resultado final: ${response.total} carros para el usuario: ${this.currentUserEmail}`);
      },
      error: (err) => {
        this.error = 'Error loading your publications: ' + err.message;
        this.loading = false;
        console.error('Error loading my cars:', err);
      }
    });
  }

  loadMoreCars() {
    if (this.currentPage < this.totalPages) {
      this.loadMyCars(this.currentPage + 1);
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

  editCar(car: Car): void {
    // For now, navigate to the same form used for creating cars
    // In the future, this could be a dedicated edit form or modal
    console.log('Edit car:', car.title);
    
    // Navigate to car form with car data
    this.router.navigate(['/vender'], { 
      state: { 
        editMode: true, 
        carData: car 
      } 
    });
  }

  deleteCar(car: Car): void {
    const confirmMessage = `¿Estás seguro de que quieres eliminar "${car.title}"?\n\nEsta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      console.log('Deleting car:', car.title);
      
      // Show loading state
      this.loading = true;
      
      this.carService.deleteCar(car.id).subscribe({
        next: (success) => {
          if (success) {
            console.log('Car deleted successfully');
            alert(`"${car.title}" ha sido eliminado exitosamente.`);
            
            // Remove car from local array to update UI immediately
            this.cars = this.cars.filter(c => c.id !== car.id);
            this.total = this.total - 1;
            
            // Reload the data to ensure consistency
            this.loadMyCars(this.currentPage);
          } else {
            alert('Error: No se pudo eliminar el carro.');
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error deleting car:', err);
          alert('Error al eliminar el carro: ' + err.message);
          this.loading = false;
        }
      });
    }
  }

  viewCarDetails(car: Car): void {
    alert(`Detalles del ${car.title}:\n\nPrecio: ${this.formatPrice(car.price)}\nAño: ${car.year}\nKilometraje: ${this.formatMileage(car.mileage)}\nUbicación: ${car.location.city}, ${car.location.state}\n\nDescripción: ${car.description || 'No disponible'}\n\nEstado: ${this.getStatusLabel(car.status)}`);
  }

  goBack(): void {
    this.router.navigate(['/marketplace']);
  }

  goToSell(): void {
    this.router.navigate(['/vender']);
  }
}
