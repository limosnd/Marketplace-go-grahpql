import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Car } from '../interfaces/car.interface';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly favoritesSubject = new BehaviorSubject<Car[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        try {
          const favorites = JSON.parse(saved);
          this.favoritesSubject.next(favorites);
        } catch (error) {
          console.error('Error loading favorites:', error);
          this.favoritesSubject.next([]);
        }
      }
    }
  }

  private saveFavorites(favorites: Car[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }

  addToFavorites(car: Car): void {
    const currentFavorites = this.favoritesSubject.value;
    if (!this.isFavorite(car.id)) {
      const newFavorites = [...currentFavorites, car];
      this.favoritesSubject.next(newFavorites);
      this.saveFavorites(newFavorites);
    }
  }

  removeFromFavorites(carId: string): void {
    const currentFavorites = this.favoritesSubject.value;
    const newFavorites = currentFavorites.filter(car => car.id !== carId);
    this.favoritesSubject.next(newFavorites);
    this.saveFavorites(newFavorites);
  }

  isFavorite(carId: string): boolean {
    return this.favoritesSubject.value.some(car => car.id === carId);
  }

  toggleFavorite(car: Car): boolean {
    if (this.isFavorite(car.id)) {
      this.removeFromFavorites(car.id);
      return false;
    } else {
      this.addToFavorites(car);
      return true;
    }
  }

  getFavorites(): Car[] {
    return this.favoritesSubject.value;
  }

  getFavoriteCount(): number {
    return this.favoritesSubject.value.length;
  }
}
