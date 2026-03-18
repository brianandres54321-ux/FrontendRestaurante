import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: number;
    tipo: 'exito' | 'error' | 'plan' | 'info';
    titulo: string;
    mensaje: string;
    duracion?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    toasts = signal<Toast[]>([]);
    private contador = 0;

    private agregar(toast: Omit<Toast, 'id'>): void {
        const id = ++this.contador;
        this.toasts.update(t => [...t, { ...toast, id }]);
        setTimeout(() => this.quitar(id), toast.duracion ?? 4000);
    }

    exito(titulo: string, mensaje = ''): void {
        this.agregar({ tipo: 'exito', titulo, mensaje });
    }

    error(titulo: string, mensaje = ''): void {
        this.agregar({ tipo: 'error', titulo, mensaje, duracion: 5000 });
    }

    plan(mensaje: string): void {
        this.agregar({
            tipo: 'plan',
            titulo: 'Límite del plan',
            mensaje,
            duracion: 7000
        });
    }

    info(titulo: string, mensaje = ''): void {
        this.agregar({ tipo: 'info', titulo, mensaje });
    }

    quitar(id: number): void {
        this.toasts.update(t => t.filter(x => x.id !== id));
    }
}