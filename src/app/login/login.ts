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

        // Check against the exact roles stored in DB ("ADMIN" / "EMPLOYEE")
        if (res.data.user.role === 'ADMIN') {
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
//          console.log('Full response:', res);
//         console.log("Login data "+JSON.stringify(res.data, null,2));

        
//          const token = res.data.token; 
//          localStorage.setItem('token', token);
         
//         this.isLoading = false;


//         if (res.data.user.role === 'admin') {
//           this.router.navigate(['/admin']);
//         } else {
//           this.router.navigate(['/employee']);
//         }
//       },
//       error: (err) => {
//         this.isLoading = false;
//         this.errorMessage = err.error?.message || 'Login failed';
//       }
//     });
//   }
// }
