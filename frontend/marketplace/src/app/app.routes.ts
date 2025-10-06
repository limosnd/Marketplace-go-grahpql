import { Routes } from '@angular/router';
import { CarList } from './car-list/car-list';
import { CarFormComponent } from './car-form/car-form';
import { Login } from './auth/login/login';
import { AuthGuard } from './guards/auth.guard';
import { Cart } from './cart/cart';
import { MyPublications } from './my-publications/my-publications';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'marketplace', component: CarList, canActivate: [AuthGuard] },
  { path: 'vender', component: CarFormComponent, canActivate: [AuthGuard] },
  { path: 'carrito', component: Cart, canActivate: [AuthGuard] },
  { path: 'mis-publicaciones', component: MyPublications, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: '**', redirectTo: '/login' }
];
