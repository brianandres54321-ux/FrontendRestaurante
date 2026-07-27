import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from './services/empresa';
import { EmpresaResponse, PlanInfo, PLANES } from '../../shared/models';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-mi-empresa',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './mi-empresa.html',
    styleUrls: ['./mi-empresa.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiEmpresa implements OnInit {

    empresa: EmpresaResponse | null = null;
    planes = PLANES;
    cargando = true;
    guardando = false;
    error = '';
    exito = '';

    // Formulario editar empresa
    modalEditar = false;
    form = { nombre: '', nitRut: '' };

    constructor(
        private empresaService: EmpresaService,
        private toastService: ToastService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.cargando = true;
        this.empresaService.miEmpresa().subscribe({
            next: (e) => {
                this.empresa = e;
                this.form = { nombre: e.nombre, nitRut: e.nitRut };
                this.cargando = false;
                this.cdr.markForCheck();
            },
            error: () => { this.cargando = false; this.cdr.markForCheck(); }
        });
    }

    get planActual(): PlanInfo {
        return this.planes.find(p => p.id === this.empresa?.plan) ?? this.planes[0];
    }

    get esTienda(): boolean {
        return this.empresa?.tipoNegocio === 'TIENDA';
    }

    esPlanActual(planId: string): boolean {
        return this.empresa?.plan === planId;
    }

    // Editar datos empresa
    abrirEditar(): void {
        this.form = { nombre: this.empresa?.nombre ?? '', nitRut: this.empresa?.nitRut ?? '' };
        this.error = '';
        this.exito = '';
        this.modalEditar = true;
        this.cdr.markForCheck();
    }

    guardarEmpresa(): void {
        if (!this.form.nombre.trim() || !this.form.nitRut.trim()) {
            this.error = 'Nombre y NIT/RUT son obligatorios.';
            return;
        }
        this.guardando = true;
        this.empresaService.actualizar({
            ...this.form,
            plan: this.empresa?.plan ?? 'BASICO'
        }).subscribe({
            next: (e) => {
                this.empresa = e;
                this.guardando = false;
                this.modalEditar = false;
                this.toastService.exito('Datos actualizados', 'Los datos de la empresa se guardaron correctamente.');
                setTimeout(() => { this.exito = ''; this.cdr.markForCheck(); }, 3000);
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.guardando = false;
                const msg = err.error?.message || 'Error al guardar.';
                if (err.status === 402) this.toastService.plan(msg);
                else this.error = msg;
                this.cdr.markForCheck();
            }
        });
    }

    // Cambiar plan
    cambiarPlan(planId: string): void {
        if (this.esPlanActual(planId)) return;
        const plan = this.planes.find(p => p.id === planId)!;
        if (!confirm(`¿Cambiar al plan ${plan.nombre} (${plan.precio})?`)) return;

        this.guardando = true;
        this.empresaService.actualizar({
            nombre: this.empresa?.nombre ?? '',
            nitRut: this.empresa?.nitRut ?? '',
            plan: planId
        }).subscribe({
            next: (e) => {
                this.empresa = e;
                this.guardando = false;

                // ✅ FIX: Refrescar el token JWT para que el nuevo plan
                // quede reflejado en los claims (permiteMercadoPago, etc.)
                this.authService.refreshToken().subscribe({
                    next: () => {
                        this.exito = `Plan cambiado a ${plan.nombre} exitosamente.`;
                        setTimeout(() => { this.exito = ''; this.cdr.markForCheck(); }, 3000);
                        this.cdr.markForCheck();
                    },
                    error: () => {
                        // Si el refresh falla, avisamos al usuario que debe
                        // volver a iniciar sesión para activar el nuevo plan
                        this.exito = `Plan cambiado a ${plan.nombre}. Cierra sesión y vuelve a entrar para activar las nuevas funciones.`;
                        setTimeout(() => { this.exito = ''; this.cdr.markForCheck(); }, 6000);
                        this.cdr.markForCheck();
                    }
                });
            },
            error: (err) => {
                this.guardando = false;
                const msg2 = err.error?.message || 'Error al cambiar plan.';
                if (err.status === 402) this.toastService.plan(msg2);
                else this.error = msg2;
                this.cdr.markForCheck();
            }
        });
    }

    getIconoPlan(planId: string): string {
        switch (planId) {
            case 'BASICO': return 'bi-star';
            case 'PRO': return 'bi-star-half';
            case 'PREMIUM': return 'bi-star-fill';
            default: return 'bi-star';
        }
    }
}