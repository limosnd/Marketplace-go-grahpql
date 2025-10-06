import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  isLoginMode = true;
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeForms();
  }

  initializeForms() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['']
    });
  }

  setMode(isLogin: boolean) {
    this.isLoginMode = isLogin;
    this.clearMessages();
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.clearMessages();

      const { email, password } = this.loginForm.value;
      
      // Intentar login inmediatamente sin delay
      if (this.authService.login(email, password)) {
        this.loading = false;
        this.successMessage = 'Inicio de sesión exitoso! Redirigiendo...';
        
        // Redirigir al marketplace inmediatamente
        this.router.navigate(['/marketplace']);
      } else {
        this.loading = false;
        this.errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
      }
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.clearMessages();

      const { name, email, password } = this.registerForm.value;
      
      // Intentar registro inmediatamente sin delay
      if (this.authService.register(name, email, password)) {
        this.loading = false;
        this.successMessage = 'Cuenta creada exitosamente! Redirigiendo...';
        
        // Redirigir al marketplace inmediatamente
        this.router.navigate(['/marketplace']);
      } else {
        this.loading = false;
        this.errorMessage = 'Error al crear la cuenta. Verifica que todos los campos sean válidos.';
      }
    }
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
