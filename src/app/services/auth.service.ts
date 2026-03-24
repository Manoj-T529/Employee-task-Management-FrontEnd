import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.services';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.api.post('/auth/login', credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token', res.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
    );
  }

  logout(): Observable<any> {
    const user = this.getUser();
    // Send the ID in the body as per your backend API logs
    return this.api.post('/auth/logout', { id: user?.id }).pipe(
      tap(() => {
        localStorage.clear();
      })
    );
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken() { return localStorage.getItem('access_token'); }
  isLoggedIn(): boolean { return !!this.getToken(); }
}


// import { Injectable } from '@angular/core';
// import { Observable, tap } from 'rxjs';
// import { ApiService } from './api.services';

// @Injectable({ providedIn: 'root' })
// export class AuthService {

//   constructor(private api: ApiService) {}

//   login(credentials: { email: string; password: string }): Observable<any> {
//     return this.api.post('/auth/login', credentials).pipe(
//       tap((res: any) => {
//         // Based on backend payload: res.data.accessToken
//         localStorage.setItem('access_token', res.data.accessToken);
//         localStorage.setItem('refresh_token', res.data.refreshToken);
//         localStorage.setItem('user', JSON.stringify(res.data.user));
//       })
//     );
//   }

//   logout(): Observable<any> {
//     return this.api.post('/auth/logout', {}).pipe(
//       tap(() => {
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         localStorage.removeItem('user');
//       })
//     );
//   }

//   getUser() {
//     const user = localStorage.getItem('user');
//     return user ? JSON.parse(user) : null;
//   }

//   getToken() {
//     return localStorage.getItem('access_token');
//   }

//   isLoggedIn(): boolean {
//     return !!this.getToken();
//   }
// }


// import { Injectable } from '@angular/core';
// import { Observable, tap } from 'rxjs';
// import { ApiService } from '../services/api.services';

// @Injectable({ providedIn: 'root' })
// export class AuthService {

//   constructor(private api: ApiService) {}

//   login(credentials: { email: string; password: string }): Observable<any> {
//     return this.api.post('/auth/login', credentials).pipe(
//       tap((res: any) => {
//         localStorage.setItem('access_token', res.token);
//         localStorage.setItem('user', JSON.stringify(res.user));
//       })
//     );
//   }

//   logout(): void {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('user');
//   }

//   getUser() {
//     const user = localStorage.getItem('user');
//     return user ? JSON.parse(user) : null;
//   }

//   getToken() {
//     return localStorage.getItem('access_token');
//   }

//   isLoggedIn(): boolean {
//     return !!this.getToken();
//   }
// }
