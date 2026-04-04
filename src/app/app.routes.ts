import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Admin } from './admin/admin';
import { Employee } from './employee/employee';
import { authGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'admin', component: Admin,canActivate: [authGuard],
    data: { roles: [1] }    },
  { path: 'employee', component: Employee,  canActivate: [authGuard],
    data: { roles: [2] }}
];
