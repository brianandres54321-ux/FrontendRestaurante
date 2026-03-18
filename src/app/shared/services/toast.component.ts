import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-wrap">
      <div
        *ngFor="let t of toastService.toasts()"
        class="toast-card toast-{{ t.tipo }}"
        (click)="t.tipo !== 'plan' && toastService.quitar(t.id)">

        <!-- Icono -->
        <div class="t-icon">
          <i class="bi" [ngClass]="{
            'bi-check-circle-fill': t.tipo === 'exito',
            'bi-x-circle-fill':    t.tipo === 'error',
            'bi-lock-fill':        t.tipo === 'plan',
            'bi-info-circle-fill': t.tipo === 'info'
          }"></i>
        </div>

        <!-- Contenido -->
        <div class="t-body">
          <span class="t-titulo">{{ t.titulo }}</span>
          <span class="t-msg" *ngIf="t.mensaje">{{ t.mensaje }}</span>
          <button *ngIf="t.tipo === 'plan'"
            class="t-btn-plan"
            (click)="irAPlanes(t.id)">
            <i class="bi bi-arrow-up-circle me-1"></i> Actualizar plan
          </button>
        </div>

        <!-- Cerrar -->
        <button class="t-close" (click)="toastService.quitar(t.id); $event.stopPropagation()">
          <i class="bi bi-x"></i>
        </button>

      </div>
    </div>
  `,
    styles: [`
    .toast-wrap {
      position: fixed;
      bottom: 28px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column-reverse;
      gap: 10px;
      pointer-events: none;
    }

    .toast-card {
      pointer-events: all;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      min-width: 300px;
      max-width: 380px;
      padding: 14px 14px 14px 16px;
      border-radius: 14px;
      box-shadow:
        0 4px 6px -1px rgba(0,0,0,.08),
        0 10px 30px -5px rgba(0,0,0,.15);
      animation: slideUp .3s cubic-bezier(.34,1.56,.64,1) both;
      backdrop-filter: blur(4px);
    }

    @keyframes slideUp {
      from { transform: translateY(20px) scale(.95); opacity: 0; }
      to   { transform: translateY(0)    scale(1);   opacity: 1; }
    }

    /* Colores */
    .toast-exito {
      background: #fff;
      border-left: 4px solid #10b981;
    }
    .toast-error {
      background: #fff;
      border-left: 4px solid #ef4444;
    }
    .toast-plan {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-left: 4px solid #f59e0b;
    }
    .toast-info {
      background: #fff;
      border-left: 4px solid #3b82f6;
    }

    /* Icono */
    .t-icon {
      font-size: 20px;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .toast-exito .t-icon { color: #10b981; }
    .toast-error .t-icon { color: #ef4444; }
    .toast-plan  .t-icon { color: #f59e0b; }
    .toast-info  .t-icon { color: #3b82f6; }

    /* Texto */
    .t-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .t-titulo {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      display: block;
    }
    .toast-plan .t-titulo { color: #f8fafc; }

    .t-msg {
      font-size: 12px;
      color: #64748b;
      line-height: 1.45;
      display: block;
    }
    .toast-plan .t-msg { color: #94a3b8; }

    /* Botón Ver planes */
    .t-btn-plan {
      margin-top: 8px;
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      background: #f59e0b;
      color: #0f172a;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: background .15s;
      width: fit-content;
    }
    .t-btn-plan:hover { background: #fbbf24; }

    /* Cerrar */
    .t-close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
      flex-shrink: 0;
      color: #94a3b8;
      transition: color .15s;
      line-height: 1;
    }
    .t-close:hover { color: #475569; }
    .toast-plan .t-close:hover { color: #e2e8f0; }

    /* Móvil */
    @media (max-width: 768px) {
      .toast-wrap {
        bottom: 80px;
        right: 12px;
        left: 12px;
      }
      .toast-card {
        min-width: unset;
        max-width: 100%;
      }
    }
  `]
})
export class ToastComponent {
    toastService = inject(ToastService);
    private router = inject(Router);

    irAPlanes(id: number): void {
        this.toastService.quitar(id);
        this.router.navigate(['/empresa']);
    }
}