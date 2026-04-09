import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    // Clear backend error banner as soon as the user starts typing again
    this.loginForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.errorMessage = '';
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login() {
    // 1. Validate Form Locally First
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); 
      return;
    }

    // 2. Lock UI & Clear old errors
    this.isLoading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    // 3. Send to Backend
    this.authService.login({email, password})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/employee']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          
          if (err.error?.errors && Array.isArray(err.error.errors)) {
            this.errorMessage = err.error.errors[0].message; 
          } else {
            this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
          }

          // THE FIX: Reset the password, but DO NOT emit a value change event!
          this.loginForm.get('password')?.reset(null, { emitEvent: false });
        }
      });
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}


// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// import { MaterialModule } from '../shared/material.module';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MaterialModule],
//   templateUrl: './login.html',
//   styleUrls: ['./login.css']
// })
// export class Login {

//   email = '';
//   password = '';
//   errorMessage = '';
//   isLoading = false;

//   constructor(
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   goToHome() {
//     this.router.navigate(['/']);
//   }

//   login(): void {
//     if (!this.email || !this.password) {
//       this.errorMessage = 'Email and password required';
//       return;
//     }

//     this.isLoading = true;
//     this.errorMessage = '';

//     this.authService.login({
//       email: this.email,
//       password: this.password
//     }).subscribe({
//       next: (res: any) => {
//         this.isLoading = false;

//         // 1. Grab the token and user safely (handles whether your controller wraps it in 'data' or not)
//         const token = res.data?.accessToken || res.accessToken;
//         const user = res.data?.user || res.user;

//         if (!token) {
//           console.error('Login Response:', res);
//           this.errorMessage = 'Login succeeded but no token received.';
//           return;
//         }

//         // 2. Save them to Local Storage (Keep the key 'access_token' since your Guard/Interceptor uses that key)
//         localStorage.setItem('access_token', token);
//         localStorage.setItem('user', JSON.stringify(user));

//         // 3. Navigate based on Role
//         if (user.role === 'ADMIN') {
//           this.router.navigate(['/admin']);
//         } else {
//           this.router.navigate(['/employee']);
//         }
//       },
//       error: (err) => {
//         this.isLoading = false;
//         this.errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
//       }
//     });
//   }
// }