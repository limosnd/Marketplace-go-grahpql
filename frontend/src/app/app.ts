import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { UserForm } from './components/user-form/user-form';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProductList, UserForm, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Marketplace');
  currentView = signal('products');

  showProducts() {
    this.currentView.set('products');
  }

  showUsers() {
    this.currentView.set('users');
  }
}
