import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Sin token → redirige a login
  if (!token) {
    void router.navigate(['/auth']);
    return false;
  }

  // Token válido
  if (!authService.isTokenExpired()) return true;

  // Token expirado → verificar si tiene refresh válido
  if (!authService.isRefreshTokenExpired()) {
    // El interceptor/timer manejará el refresh, permitir acceso
    return true;
  }

  // Ambos expirados → sesión expirada
  authService.sessionExpired.set(true);
  return true;
};
