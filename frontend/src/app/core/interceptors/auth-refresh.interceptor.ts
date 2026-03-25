import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/authService/auth.service';

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      // Solo manejar 401
      if (error?.status !== 401) return throwError(() => error);

      // No reintentar si es el endpoint de refresh (evita loop infinito)
      if (req.url.includes('/auth/refresh')) return throwError(() => error);

      // Sin refresh token disponible
      if (!authService.getRefreshToken()) return throwError(() => error);

      // Convertir el refresh (Promise) a Observable y reintentar la petición original
      return new Observable<HttpEvent<unknown>>((observer) => {
        authService
          .refresh()
          .then((refreshResponse) => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${refreshResponse.access_token}`,
              },
            });
            next(retryReq).subscribe({
              next: (response) => observer.next(response),
              error: (err) => observer.error(err),
              complete: () => observer.complete(),
            });
          })
          .catch((refreshError) => observer.error(refreshError));
      });
    }),
  );
};
