import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const user = authService.getUserSnapshot();

  if (user?.token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`
      }
    });
    return next(clonedReq);
  }
  return next(req);
};
