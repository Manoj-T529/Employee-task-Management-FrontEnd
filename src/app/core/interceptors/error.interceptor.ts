import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../../shared/ui/toast.service';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toast: ToastService, private auth: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = 'An unknown network error occurred.';

        // FAANG Standard: Check for Zod structured errors from backend
        if (error.error?.errors && Array.isArray(error.error.errors)) {
          // Extract the first Zod error message
          errorMsg = error.error.errors[0].message;
        } else if (error.error?.message) {
          // Fallback to standard AppError message
          errorMsg = error.error.message;
        }

        switch (error.status) {
          case 400:
            this.toast.error(`Validation Failed: ${errorMsg}`);
            break;
         case 401:
            // IF the error comes from the login endpoint, DO NOT trigger a logout. 
            // Just pass the error down to the component to handle.
            if (request.url.includes('/auth/login')) {
              break; 
            }
            
            // Otherwise, it's a real session expiration.
            this.auth.logout(); 
            this.toast.error('Session expired. Please log in again.');
            break;
          case 403:
            this.toast.error('You do not have permission to perform this action.');
            break;
          case 404:
            this.toast.error('The requested resource was not found.');
            break;
          case 429:
            this.toast.error('You are doing that too fast. Please slow down!');
            break;
          case 500:
            this.toast.error('A server error occurred. Our engineers have been notified.');
            break;
          default:
            this.toast.error(errorMsg);
        }

        return throwError(() => error);
      })
    );
  }
}