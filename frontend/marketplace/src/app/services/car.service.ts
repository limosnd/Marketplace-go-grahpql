import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { 
  GET_CARS, 
  GET_CAR, 
  CREATE_CAR, 
  SEARCH_CARS, 
  HEALTH_CHECK 
} from '../graphql/queries';

import {
  Car,
  CarsResponse,
  CarInput,
  CarFilterInput,
  GetCarsQueryResponse,
  GetCarQueryResponse,
  CreateCarMutationResponse,
  SearchCarsQueryResponse,
  HealthCheckResponse
} from '../interfaces/car.interface';

@Injectable({
  providedIn: 'root'
})
export class CarService {

  constructor(private apollo: Apollo) { }

  // Get all cars with pagination and filtering
  getCars(filter?: CarFilterInput, page: number = 1, limit: number = 10): Observable<CarsResponse> {
    return this.apollo
      .watchQuery<GetCarsQueryResponse>({
        query: GET_CARS,
        variables: { filter, page, limit }
      })
      .valueChanges
      .pipe(
        map(result => result.data.cars)
      );
  }

  // Get single car by ID
  getCar(id: string): Observable<Car> {
    return this.apollo
      .watchQuery<GetCarQueryResponse>({
        query: GET_CAR,
        variables: { id }
      })
      .valueChanges
      .pipe(
        map(result => result.data.car)
      );
  }

  // Create new car
  createCar(input: CarInput): Observable<Car> {
    return this.apollo
      .mutate<CreateCarMutationResponse>({
        mutation: CREATE_CAR,
        variables: { input },
        refetchQueries: [{ query: GET_CARS }] // Refresh the car list after creating
      })
      .pipe(
        map(result => result.data!.createCar)
      );
  }

  // Search cars by text
  searchCars(query: string, page: number = 1, limit: number = 10): Observable<CarsResponse> {
    return this.apollo
      .watchQuery<SearchCarsQueryResponse>({
        query: SEARCH_CARS,
        variables: { query, page, limit }
      })
      .valueChanges
      .pipe(
        map(result => result.data.searchCars)
      );
  }

  // Health check
  healthCheck(): Observable<string> {
    return this.apollo
      .query<HealthCheckResponse>({
        query: HEALTH_CHECK
      })
      .pipe(
        map(result => result.data.health)
      );
  }

  // Format price to currency
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // Format mileage
  formatMileage(mileage: number): string {
    return new Intl.NumberFormat('es-ES').format(mileage) + ' km';
  }

  // Get fuel type label in Spanish
  getFuelTypeLabel(fuelType: string): string {
    const labels: { [key: string]: string } = {
      'GASOLINE': '⛽ Gasolina',
      'DIESEL': '🛢️ Diesel',
      'ELECTRIC': '⚡ Eléctrico',
      'HYBRID': '🔋 Híbrido'
    };
    return labels[fuelType] || fuelType;
  }

  // Get transmission type label in Spanish
  getTransmissionLabel(transmission: string): string {
    return transmission === 'AUTOMATIC' ? 'Automática' : 'Manual';
  }

  // Get status label in Spanish
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'AVAILABLE': 'Disponible',
      'SOLD': 'Vendido',
      'PENDING': 'Pendiente'
    };
    return labels[status] || status;
  }
}
