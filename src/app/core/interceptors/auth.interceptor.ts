import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Use the access_token mapped from the new backend payload
  const token = localStorage.getItem('access_token');

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};


// src/app/core/interceptors/auth.interceptor.ts

// import { HttpInterceptorFn } from '@angular/common/http';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {

//   const token = localStorage.getItem('token');

//   if (!token) {
//     return next(req);
//   }

//   const authReq = req.clone({
//     setHeaders: {
//       Authorization: `Bearer ${token}`
//     }
//   });

//   return next(authReq);
// };