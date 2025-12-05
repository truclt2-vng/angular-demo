import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Skip adding token for the authenticate endpoint
  if (req.url.includes('/authenticate')) {
    return next(req);
  }

  // Check if authenticated and token is not expired
  if (authService.isAuthenticated()) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  } else if (token) {
    // Token exists but is expired - redirect to signin
    authService.removeToken();
    router.navigate(['/signin']);
  }

  return next(req);
};
