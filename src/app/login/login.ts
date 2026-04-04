import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MaterialModule } from '../shared/material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  goToHome() {
    this.router.navigate(['/']);
  }

  login(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        // 1. Grab the token and user safely (handles whether your controller wraps it in 'data' or not)
        const token = res.data?.accessToken || res.accessToken;
        const user = res.data?.user || res.user;

        if (!token) {
          console.error('Login Response:', res);
          this.errorMessage = 'Login succeeded but no token received.';
          return;
        }

        // 2. Save them to Local Storage (Keep the key 'access_token' since your Guard/Interceptor uses that key)
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // 3. Navigate based on Role
        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/employee']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
      }
    });
  }
}