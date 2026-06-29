import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';

let isLoggingOut = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUserSnapshot();

  // Allow auth APIs without token
  const isAuthApi =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/sendOtpForLogin') ||
    req.url.includes('/auth/verifyOTPForLogin') ||
    req.url.includes('/auth/getLoginType');

  // Block every protected API after logout
  if (!user && !isAuthApi) {
    return EMPTY;
  }

  let authReq = req;
  if (user?.token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoggingOut) {
        isLoggingOut = true;
        authService.clearUser();
        if (router.url !== '/auth/login') {
          router.navigate(['/auth/login']);
        }
        // router.navigateByUrl('/auth/login', {
        //   replaceUrl: true
        // });
      }
      return throwError(() => error);
    })
  );
};
