import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {

  // Defaulting to v1 as specified in your backend
  private baseUrl = environment.apiBaseUrl || 'http://localhost:5000/api/v1';

  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${url}`, { params });
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${url}`, body);
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${url}`, body);
  }

  patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${url}`, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${url}`);
  }
}

// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { environment } from '../../environments/environment';
// import { Observable } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class ApiService {

//   private baseUrl = environment.apiBaseUrl;

//   constructor(private http: HttpClient) {}

//   get<T>(url: string, params?: any): Observable<T> {
//     return this.http.get<T>(`${this.baseUrl}${url}`, { params });
//   }

//   post<T>(url: string, body: any): Observable<T> {
//     return this.http.post<T>(`${this.baseUrl}${url}`, body);
//   }

//   put<T>(url: string, body: any): Observable<T> {
//     return this.http.put<T>(`${this.baseUrl}${url}`, body);
//   }

//   delete<T>(url: string): Observable<T> {
//     return this.http.delete<T>(`${this.baseUrl}${url}`);
//   }
// }
