import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snack = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || err.status === 403) {
        auth.logout();
        router.navigate(['/login']);
      } else if (err.status >= 500) {
        snack.open(err.error?.message ?? 'Server error', 'OK', { duration: 4000 });
      } else if (err.status >= 400 && err.error?.message) {
        snack.open(err.error.message, 'OK', { duration: 4000 });
      }
      return throwError(() => err);
    })
  );
};
