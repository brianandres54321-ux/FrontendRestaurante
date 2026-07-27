import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * El backend ahora valida en TODAS las rutas /empresas/{empresaId}/** que el
 * empresaId de la URL coincida con el del JWT (TenantAccessInterceptor), y
 * responde 403 con { message } cuando no coincide. Ese 403 significa que la
 * sesión ya no es válida para lo que se está pidiendo, así que forzamos logout.
 *
 * Un 403 sin "message" es el AccessDeniedHandler por defecto de Spring
 * (@PreAuthorize por rol insuficiente): el token sigue siendo válido, así que
 * solo avisamos sin cerrar sesión.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 403) {
        const mensaje = err.error?.message;
        if (mensaje) {
          alert(mensaje);
          authService.logout();
        } else {
          alert('No tienes permisos para realizar esta acción.');
        }
      }
      return throwError(() => err);
    })
  );
};
