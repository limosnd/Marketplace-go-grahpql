import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from '../../services/marketplace.service';
import { CreateUserInput, User } from '../../models/marketplace.model';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserForm {
  userInput: CreateUserInput = {
    username: '',
    email: ''
  };

  isSubmitting = false;
  message = '';

  constructor(private marketplaceService: MarketplaceService) {}

  onSubmit(): void {
    if (!this.userInput.username || !this.userInput.email) {
      this.message = 'Please fill in all fields';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    this.marketplaceService.createUser(this.userInput).subscribe({
      next: (user: User) => {
        this.message = `User ${user.username} created successfully!`;
        this.userInput = { username: '', email: '' };
        this.isSubmitting = false;
      },
      error: (error) => {
        this.message = 'Error creating user: ' + error.message;
        this.isSubmitting = false;
      }
    });
  }
}
