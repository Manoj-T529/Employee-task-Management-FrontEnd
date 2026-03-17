import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Admin } from './admin/admin';
import { Employee } from './employee/employee';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'admin', component: Admin },
  { path: 'employee', component: Employee }
];
