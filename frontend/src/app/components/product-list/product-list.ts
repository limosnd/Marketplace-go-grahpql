import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Product } from '../../models/marketplace.model';
import { MarketplaceService } from '../../services/marketplace.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {
  products$: Observable<Product[]> | undefined;

  constructor(private marketplaceService: MarketplaceService) {}

  ngOnInit(): void {
    this.products$ = this.marketplaceService.getProducts();
  }
}
