import { Routes } from '@angular/router';
import { CarList } from './car-list/car-list';
import { CarFormComponent } from './car-form/car-form';

export const routes: Routes = [
  { path: '', component: CarList },
  { path: 'vender', component: CarFormComponent },
  { path: '**', redirectTo: '' }
];
