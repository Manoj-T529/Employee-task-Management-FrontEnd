import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../shared/material.module';

@Component({
  selector: 'app-home',
  imports: [MaterialModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

   constructor(private router: Router) {}

  goToLogin() {
  this.router.navigate(['/login']);
}

}
