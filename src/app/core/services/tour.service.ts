import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface TourStep {
  target: string | null;
  titulo: string;
  texto: string;
}

@Injectable({ providedIn: 'root' })
export class TourService {
  private authService = inject(AuthService);

  private pasos: TourStep[] = [
    {
      target: null,
      titulo: '¡Bienvenido a tu sistema de facturación!',
      texto: 'Te mostramos en unos pocos pasos cómo empezar a usarlo.'
    },
    {
      target: '#tour-nav-productos',
      titulo: 'Productos',
      texto: 'Lo primero que tenés que hacer es cargar tus productos. Desde acá los vas a administrar.'
    },
    {
      target: '#tour-add-product-btn',
      titulo: 'Creá tu primer producto',
      texto: 'Hacé clic en "Nuevo" para cargar el nombre, precio y categoría de tu primer producto.'
    },
    {
      target: '#tour-nav-categorias',
      titulo: 'Categorías',
      texto: 'Podés agrupar tus productos en categorías para encontrarlos más rápido.'
    },
    {
      target: null,
      titulo: '¡Listo para empezar!',
      texto: 'Ya tenés lo básico. Podés volver a recorrer estos pasos desde "Ayuda" cuando quieras.'
    }
  ];

  activo = signal(false);
  pasoActual = signal(0);

  get pasoActualData(): TourStep {
    return this.pasos[this.pasoActual()];
  }

  get totalPasos(): number {
    return this.pasos.length;
  }

  get esUltimoPaso(): boolean {
    return this.pasoActual() === this.pasos.length - 1;
  }

  private claveUsuario(): string {
    return `tour_estado_${this.authService.getUsuarioId()}`;
  }

  /** Llamar justo después de un registro exitoso, para marcar la cuenta como nueva. */
  marcarNuevoUsuario(): void {
    localStorage.setItem(this.claveUsuario(), 'pendiente');
  }

  /** Llamar al entrar al layout autenticado: inicia el tour solo si sigue pendiente. */
  iniciarSiCorresponde(): void {
    if (localStorage.getItem(this.claveUsuario()) === 'pendiente') {
      setTimeout(() => {
        this.pasoActual.set(0);
        this.activo.set(true);
      }, 400);
    }
  }

  siguiente(): void {
    if (this.esUltimoPaso) {
      this.finalizar();
      return;
    }
    this.pasoActual.update(p => p + 1);
  }

  anterior(): void {
    this.pasoActual.update(p => Math.max(0, p - 1));
  }

  saltar(): void {
    this.finalizar();
  }

  reiniciar(): void {
    this.pasoActual.set(0);
    this.activo.set(true);
  }

  private finalizar(): void {
    this.activo.set(false);
    localStorage.setItem(this.claveUsuario(), 'completado');
  }
}
