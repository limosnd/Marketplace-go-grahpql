// Enums
export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID'
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC'
}

export enum CarStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  PENDING = 'PENDING'
}

export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN'
}

// Interfaces
export interface Location {
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Car {
  id: string;
  title: string;
  description: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  status: CarStatus;
  images: string[];
  seller: User;
  location: Location;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CarsResponse {
  cars: Car[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Input types
export interface LocationInput {
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface CarInput {
  title: string;
  description: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  images: string[];
  location: LocationInput;
  features: string[];
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
}

export interface CarFilterInput {
  brand?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  city?: string;
  state?: string;
}

export interface UpdateCarInput {
  id: string;
  title?: string;
  description?: string;
  brand?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
  color?: string;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  status?: CarStatus;
  images?: string[];
  location?: LocationInput;
  features?: string[];
}

// GraphQL response types
export interface GetCarsQueryResponse {
  cars: CarsResponse;
}

export interface GetCarQueryResponse {
  car: Car;
}

export interface CreateCarMutationResponse {
  createCar: Car;
}

export interface SearchCarsQueryResponse {
  searchCars: CarsResponse;
}

export interface GetMyCarsQueryResponse {
  cars: CarsResponse;
}

export interface DeleteCarMutationResponse {
  deleteCar: boolean;
}

export interface UpdateCarMutationResponse {
  updateCar: Car;
}

export interface HealthCheckResponse {
  health: string;
}
