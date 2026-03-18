// ── role-guard.ts — REEMPLAZAR el archivo completo ────────────
// Agrega el guard cocinaGuard al archivo existente

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const rol = auth.getRol()?.toUpperCase();
    if (rol === 'ADMIN') return true;
    router.navigate(['/mesas']);
    return false;
};

export const adminCajeroGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const rol = auth.getRol()?.toUpperCase();
    if (rol === 'ADMIN' || rol === 'CAJERO') return true;
    router.navigate(['/mesas']);
    return false;
};

// KDS accesible por todos los roles autenticados (incluso MESERO)
export const cocinaGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.estaAutenticado()) return true;
    router.navigate(['/login']);
    return false;
};