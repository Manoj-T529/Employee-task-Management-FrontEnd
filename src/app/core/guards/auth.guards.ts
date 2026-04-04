import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);

  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');

  // 1. If missing Auth -> Safe redirect to login
  if (!token || !userStr) {
    return router.parseUrl('/login');
  }

  try {
    const user = JSON.parse(userStr);
    const allowedRoles = route.data['roles'] as Array<number>;

    if (allowedRoles && allowedRoles.length > 0) {
      
      // 2. Map your Database Roles to the numbers in your app.routes.ts
      // "ADMIN" = 1, Anything else ("EMPLOYEE") = 2
      const userRoleNum = (user.role === 'ADMIN') ? 1 : 2;

      // 3. CHECK PERMISSION
      if (!allowedRoles.includes(userRoleNum)) {
        
        // They don't have access. Figure out where they SHOULD be:
        const correctPath = userRoleNum === 1 ? '/admin' : '/employee';

        // 4. LOOP PREVENTION
        if (state.url.includes(correctPath)) {
          return false; 
        }

        // 5. BULLETPROOF REDIRECT
        return router.parseUrl(correctPath);
      }
    }

    // 6. Access Granted!
    return true; 
    
  } catch (error) {
    // If local storage is corrupted
    localStorage.clear();
    return router.parseUrl('/login');
  }
};