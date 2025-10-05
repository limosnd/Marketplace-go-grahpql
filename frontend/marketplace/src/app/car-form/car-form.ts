import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarService } from '../services/car.service';
import { CarInput, FuelType, TransmissionType } from '../interfaces/car.interface';

@Component({
  selector: 'app-car-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './car-form.html',
  styleUrl: './car-form.css'
})
export class CarFormComponent implements OnInit {
  carForm!: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess = false;
  maxYear = new Date().getFullYear() + 1;

  // Opciones para los selects
  brands = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Volkswagen', 
    'BMW', 'Mercedes-Benz', 'Audi', 'Hyundai', 'Kia', 'Mazda',
    'Subaru', 'Jeep', 'Dodge', 'Ram', 'Chrysler', 'Cadillac',
    'Lexus', 'Infiniti', 'Acura', 'Mitsubishi', 'Fiat', 'Alfa Romeo',
    'Jaguar', 'Land Rover', 'Volvo', 'Peugeot', 'Renault', 'Citroën'
  ];

  fuelTypes = [
    { value: FuelType.GASOLINE, label: 'Gasolina' },
    { value: FuelType.DIESEL, label: 'Diesel' },
    { value: FuelType.HYBRID, label: 'Híbrido' },
    { value: FuelType.ELECTRIC, label: 'Eléctrico' }
  ];

  transmissions = [
    { value: TransmissionType.MANUAL, label: 'Manual' },
    { value: TransmissionType.AUTOMATIC, label: 'Automática' }
  ];

  colors = ['Blanco', 'Negro', 'Gris', 'Plateado', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Naranja', 'Morado', 'Marrón', 'Beige'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly carService: CarService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.carForm = this.fb.group({
      // Información básica del vehículo
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1000)]],
      brand: ['', Validators.required],
      model: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      
      // Especificaciones técnicas
      fuelType: ['', Validators.required],
      transmission: ['', Validators.required],
      mileage: ['', [Validators.required, Validators.min(0)]],
      color: ['', Validators.required],
      
      // Precio
      price: ['', [Validators.required, Validators.min(1000)]],
      
      // Características
      features: [''],
      
      // Imágenes
      imageUrl: ['', Validators.required],
      
      // Información del vendedor
      sellerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      sellerPhone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s\-()]{7,15}$/)]],
      sellerEmail: ['', [Validators.required, Validators.email]],
      
      // Ubicación
      locationCity: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      locationState: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      locationCountry: ['Colombia', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.carForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitError = null;
      this.submitSuccess = false;

      const formData = this.carForm.value;
      
      // Procesar features (convertir string a array)
      const features = formData.features ? 
        formData.features.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0) : 
        [];

      const carInput: CarInput = {
        title: formData.title,
        description: formData.description || '',
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        mileage: parseInt(formData.mileage),
        color: formData.color,
        fuelType: formData.fuelType as FuelType,
        transmission: formData.transmission as TransmissionType,
        images: [formData.imageUrl],
        features: features,
        sellerName: formData.sellerName,
        sellerPhone: formData.sellerPhone,
        sellerEmail: formData.sellerEmail,
        location: {
          city: formData.locationCity,
          state: formData.locationState,
          country: formData.locationCountry
        }
      };

      this.carService.createCar(carInput).subscribe({
        next: (result) => {
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.submitError = null;
          
          // Opcional: redirigir después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitError = error.message || 'Error al crear el anuncio. Por favor intenta de nuevo.';
          console.error('Error creating car:', error);
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched(this.carForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  // Métodos auxiliares para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.carForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.carForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `${fieldName} debe tener máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} debe ser menor a ${field.errors['max'].max}`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['pattern']) return `${fieldName} tiene formato inválido`;
    }
    return '';
  }

  resetForm(): void {
    this.carForm.reset();
    this.submitError = null;
    this.submitSuccess = false;
    this.isSubmitting = false;
    this.initializeForm();
  }
}
