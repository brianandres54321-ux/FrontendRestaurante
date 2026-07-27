import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuponService } from './services/cupon';
import { AuthService } from '../../core/services/auth.service';
import { Cupon, CuponRequest } from '../../shared/models';

@Component({
    selector: 'app-cupones',
    standalone: true,
    imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
    templateUrl: './lista-cupones.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuponesComponent implements OnInit {

    cupones: Cupon[] = [];
    cargando = true;
    guardando = false;
    modalAbierto = false;
    editando: Cupon | null = null;
    errorModal = '';

    form: CuponRequest = this.formVacio();

    private empresaId!: number;

    constructor(
        private cuponService: CuponService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.empresaId = this.authService.getEmpresaId();
        this.cargar();
    }

    cargar(): void {
        this.cargando = true;
        this.cuponService.listar(this.empresaId).subscribe({
            next: (data) => { this.cupones = data; this.cargando = false; this.cdr.markForCheck(); },
            error: () => { this.cargando = false; this.cdr.markForCheck(); }
        });
    }

    abrirModal(cupon?: Cupon): void {
        this.editando = cupon ?? null;
        this.errorModal = '';
        this.form = cupon ? {
            codigo: cupon.codigo,
            descripcion: cupon.descripcion,
            tipo: cupon.tipo,
            valor: cupon.valor,
            usosMaximos: cupon.usosMaximos,
            fechaInicio: cupon.fechaInicio,
            fechaFin: cupon.fechaFin,
            montoMinimo: cupon.montoMinimo,
            activo: cupon.activo,
        } : this.formVacio();
        this.modalAbierto = true;
        this.cdr.markForCheck();
    }

    cerrarModal(): void {
        this.modalAbierto = false;
        this.editando = null;
        this.cdr.markForCheck();
    }

    guardar(): void {
        if (!this.form.codigo.trim()) { this.errorModal = 'El código es obligatorio.'; return; }
        if (!this.form.valor || this.form.valor <= 0) { this.errorModal = 'El valor debe ser mayor a 0.'; return; }
        if (this.form.tipo === 'PORCENTAJE' && this.form.valor > 100) {
            this.errorModal = 'El porcentaje no puede superar 100%.'; return;
        }

        this.guardando = true;
        this.errorModal = '';

        const op = this.editando
            ? this.cuponService.actualizar(this.empresaId, this.editando.id, this.form)
            : this.cuponService.crear(this.empresaId, this.form);

        op.subscribe({
            next: () => {
                this.guardando = false;
                this.cerrarModal();
                this.cargar();
            },
            error: (err) => {
                this.guardando = false;
                this.errorModal = err.error?.message ?? 'Error al guardar.';
                this.cdr.markForCheck();
            }
        });
    }

    eliminar(cupon: Cupon): void {
        if (!confirm(`¿Eliminar el cupón "${cupon.codigo}"? Esta acción no se puede deshacer.`)) return;
        this.cuponService.eliminar(this.empresaId, cupon.id).subscribe({
            next: () => this.cargar(),
            error: (err) => alert(err.error?.message ?? 'Error al eliminar.')
        });
    }

    private formVacio(): CuponRequest {
        return {
            codigo: '', descripcion: '', tipo: 'PORCENTAJE',
            valor: 0, usosMaximos: null, fechaInicio: null,
            fechaFin: null, montoMinimo: null, activo: true,
        };
    }
}