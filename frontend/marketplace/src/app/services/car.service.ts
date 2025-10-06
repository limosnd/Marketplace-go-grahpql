import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { 
  GET_CARS, 
  GET_CAR, 
  CREATE_CAR, 
  DELETE_CAR,
  UPDATE_CAR,
  SEARCH_CARS, 
  GET_MY_CARS,
  HEALTH_CHECK 
} from '../graphql/queries';

import {
  Car,
  CarsResponse,
  CarInput,
  UpdateCarInput,
  CarFilterInput,
  GetCarsQueryResponse,
  GetCarQueryResponse,
  CreateCarMutationResponse,
  DeleteCarMutationResponse,
  UpdateCarMutationResponse,
  SearchCarsQueryResponse,
  GetMyCarsQueryResponse,
  HealthCheckResponse
} from '../interfaces/car.interface';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  
  private readonly carCreatedSubject = new Subject<Car>();
  public carCreated$ = this.carCreatedSubject.asObservable();
  
  private readonly carUpdatedSubject = new Subject<Car>();
  public carUpdated$ = this.carUpdatedSubject.asObservable();
  
  private readonly carDeletedSubject = new Subject<string>();
  public carDeleted$ = this.carDeletedSubject.asObservable();

  constructor(private readonly apollo: Apollo) { }

  // Get all cars with pagination and filtering
  getCars(filter?: CarFilterInput, page: number = 1, limit: number = 10): Observable<CarsResponse> {
    return this.apollo
      .watchQuery<GetCarsQueryResponse>({
        query: GET_CARS,
        variables: { filter, page, limit },
        fetchPolicy: 'cache-and-network' // Always fetch fresh data
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
        map(result => {
          const newCar = result.data!.createCar;
          // Emit event when car is created
          this.carCreatedSubject.next(newCar);
          return newCar;
        })
      );
  }

  // Update existing car
  updateCar(input: UpdateCarInput): Observable<Car> {
    return this.apollo
      .mutate<UpdateCarMutationResponse>({
        mutation: UPDATE_CAR,
        variables: { input },
        refetchQueries: [{ query: GET_CARS }] // Refresh the car list after updating
      })
      .pipe(
        map(result => {
          const updatedCar = result.data!.updateCar;
          // Emit event when car is updated
          this.carUpdatedSubject.next(updatedCar);
          return updatedCar;
        })
      );
  }

  // Delete car
  deleteCar(id: string): Observable<boolean> {
    return this.apollo
      .mutate<DeleteCarMutationResponse>({
        mutation: DELETE_CAR,
        variables: { id },
        refetchQueries: [{ query: GET_CARS }] // Refresh the car list after deleting
      })
      .pipe(
        map(result => {
          const success = result.data!.deleteCar;
          if (success) {
            // Emit event when car is deleted
            this.carDeletedSubject.next(id);
          }
          return success;
        })
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

  // Get my published cars only
  getMyCars(page: number = 1, limit: number = 10): Observable<CarsResponse> {
    return this.apollo
      .watchQuery<GetMyCarsQueryResponse>({
        query: GET_MY_CARS,
        variables: { page, limit }
      })
      .valueChanges
      .pipe(
        map(result => result.data.cars)
      );
  }

  // Get cars filtered by user email - real implementation
  getCarsByUserEmail(userEmail: string, page: number = 1, limit: number = 10): Observable<CarsResponse> {
    console.log(`=== CAR SERVICE DEBUG ===`);
    console.log(`Filtrando carros por email: "${userEmail}"`);
    
    return this.apollo
      .watchQuery<GetCarsQueryResponse>({
        query: GET_CARS,
        variables: { page, limit }
      })
      .valueChanges
      .pipe(
        map(result => {
          console.log('Total de carros obtenidos del servidor:', result.data.cars.cars.length);
          
          // Log all car emails for debugging
          console.log('Emails de todos los carros:');
          result.data.cars.cars.forEach((car, index) => {
            console.log(`${index + 1}. "${car.seller.email}" vs "${userEmail}" = ${car.seller.email.toLowerCase() === userEmail.toLowerCase()}`);
          });
          
          // Filter cars by seller email
          const filteredCars = result.data.cars.cars.filter(car => 
            car.seller.email.toLowerCase() === userEmail.toLowerCase()
          );
          
          console.log(`Carros filtrados: ${filteredCars.length}`);
          
          // Create a new response with filtered cars
          return {
            cars: filteredCars,
            total: filteredCars.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(filteredCars.length / limit)
          };
        })
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
