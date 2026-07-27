import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// "Home" seguro para cualquier rol autenticado, según el tipo de negocio.
function rutaHome(auth: AuthService): string {
    return auth.esRestaurante ? '/mesas' : '/venta-directa';
}

export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const rol = auth.getRol()?.toUpperCase();
    if (rol === 'ADMIN') return true;
    router.navigate([rutaHome(auth)]);
    return false;
};

export const adminCajeroGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const rol = auth.getRol()?.toUpperCase();
    if (rol === 'ADMIN' || rol === 'CAJERO') return true;
    router.navigate([rutaHome(auth)]);
    return false;
};

// KDS accesible por todos los roles autenticados (incluso MESERO),
// pero solo tiene sentido para negocios tipo RESTAURANTE.
export const cocinaGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.estaAutenticado()) {
        router.navigate(['/login']);
        return false;
    }
    if (!auth.esRestaurante) {
        router.navigate([rutaHome(auth)]);
        return false;
    }
    return true;
};

// Mesas, secciones y cocina solo aplican a negocios tipo RESTAURANTE.
export const restauranteGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.esRestaurante) return true;
    router.navigate([rutaHome(auth)]);
    return false;
};

// Venta directa solo aplica a negocios tipo TIENDA (por ahora).
export const tiendaGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.esTienda) return true;
    router.navigate([rutaHome(auth)]);
    return false;
};
