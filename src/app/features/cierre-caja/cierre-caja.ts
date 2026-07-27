import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CierreCajaService } from './services/cierre-caja';
import { AuthService } from '../../core/services/auth.service';
import { CierreCaja } from '../../shared/models';

@Component({
    selector: 'app-cierre-caja',
    standalone: true,
    imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
    templateUrl: './cierre-caja.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CierreCajaComponent implements OnInit {

    // ── Estado ────────────────────────────────────────────────────
    preview: CierreCaja | null = null;
    historial: CierreCaja[] = [];
    cierreSeleccionado: CierreCaja | null = null;

    fechaSeleccionada = '';
    notasCierre = '';
    hoy = new Date().toISOString().split('T')[0];

    baseInput: number | null = null;
    guardandoBase = false;

    cargando = false;
    cargandoHistorial = false;
    procesando = false;
    verHistorial = false;
    error = '';

    private empresaId!: number;

    constructor(
        private cierreService: CierreCajaService,
        public authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.empresaId = this.authService.getEmpresaId();
        this.fechaSeleccionada = this.hoy;
        this.cargarPreview();
    }

    // ── Preview ───────────────────────────────────────────────────

    cargarPreview(): void {
        if (!this.fechaSeleccionada) return;
        this.cargando = true;
        this.error = '';
        this.preview = null;

        this.cierreService.preview(this.empresaId, this.fechaSeleccionada).subscribe({
            next: (data) => {
                this.preview = data;
                this.baseInput = data.baseInicial;
                this.cargando = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.cargando = false;
                this.error = err.error?.message ?? 'Error al cargar el resumen.';
                this.cdr.markForCheck();
            }
        });
    }

    // ── Base de caja ─────────────────────────────────────────────

    registrarBase(): void {
        if (this.baseInput === null || this.baseInput < 0 || this.guardandoBase) return;

        this.guardandoBase = true;
        this.error = '';

        this.cierreService.registrarBase(this.empresaId, this.fechaSeleccionada, this.baseInput).subscribe({
            next: (data) => {
                this.preview = data;
                this.guardandoBase = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.guardandoBase = false;
                this.error = err.error?.message ?? 'No se pudo registrar la base de caja.';
                this.cdr.markForCheck();
            }
        });
    }

    // ── Confirmar cierre ──────────────────────────────────────────

    confirmarCierre(): void {
        if (!this.preview || this.preview.yaExiste || this.procesando) return;
        if (this.preview.cantidadPedidos === 0) return;
        if (!this.preview.baseRegistrada) return;

        const fecha = this.fechaSeleccionada;
        if (!confirm(`¿Confirmar cierre de caja del ${this.formatFecha(fecha)}?\nEsta acción no se puede deshacer.`)) return;

        this.procesando = true;
        this.error = '';

        this.cierreService.ejecutar(this.empresaId, fecha, this.notasCierre).subscribe({
            next: (cierre) => {
                this.preview = { ...cierre, pagos: this.preview?.pagos ?? [] };
                this.procesando = false;
                this.notasCierre = '';
                // Refrescar historial si estaba cargado
                if (this.historial.length > 0) this.cargarHistorial();
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.procesando = false;
                this.error = err.error?.message ?? 'Error al ejecutar el cierre.';
                this.cdr.markForCheck();
            }
        });
    }

    // ── Historial ─────────────────────────────────────────────────

    cargarHistorial(): void {
        this.cargandoHistorial = true;
        this.cierreService.historial(this.empresaId).subscribe({
            next: (data) => {
                this.historial = data;
                this.cargandoHistorial = false;
                this.cdr.markForCheck();
            },
            error: () => { this.cargandoHistorial = false; this.cdr.markForCheck(); }
        });
    }

    // Al abrir el historial, cargarlo si aún no está
    toggleHistorial(): void {
        this.verHistorial = !this.verHistorial;
        if (this.verHistorial && this.historial.length === 0) {
            this.cargarHistorial();
        }
    }

    // ── Detalle desde historial ───────────────────────────────────

    verDetalle(cierre: CierreCaja): void {
        if (this.cierreSeleccionado?.id === cierre.id) {
            this.cierreSeleccionado = null;
            this.cdr.markForCheck();
            return;
        }
        if (!cierre.id) return;

        this.cierreService.detalle(this.empresaId, cierre.id).subscribe({
            next: (data) => {
                this.cierreSeleccionado = data;
                this.cdr.markForCheck();
            }
        });
    }

    // ── Helper ────────────────────────────────────────────────────

    private formatFecha(iso: string): string {
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
    }
}