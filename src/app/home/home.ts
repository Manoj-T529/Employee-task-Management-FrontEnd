import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '../shared/material.module';

@Component({
  selector: 'app-home',
  standalone: true, 
  imports: [CommonModule, MaterialModule], // Added CommonModule for structural directives if needed
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  isLoggedIn: boolean = false;
  userRole: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if user already has an active session
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token'); // or whatever your token key is

    if (userStr && token) {
      this.isLoggedIn = true;
      const user = JSON.parse(userStr);
      this.userRole = user.role;
    }
  }

  // Smart CTA Handler
  handleAction() {
    if (this.isLoggedIn) {
      // Route to appropriate workspace if already authenticated
      this.router.navigate([this.userRole === 'ADMIN' ? '/admin' : '/employee']);
    } else {
      // Otherwise go to login
      this.router.navigate(['/login']);
    }
  }
}