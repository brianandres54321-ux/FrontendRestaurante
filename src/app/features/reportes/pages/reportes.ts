
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReporteService } from '../services/reporte.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReporteVentas } from '../models/reporte.model';

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, DatePipe],
    templateUrl: './reportes.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesComponent implements OnInit {

    reporte: ReporteVentas | null = null;
    cargando = false;
    descargando = false;
    error = '';
    errorPlan = false;

    filtroDesde = '';
    filtroHasta = '';
    hoy = new Date().toISOString().split('T')[0];

    private empresaId!: number;

    constructor(
        private reporteService: ReporteService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.empresaId = this.authService.getEmpresaId();
        this.setRango('mes');       // Arranca con el mes actual por defecto
        this.cargarReporte();
    }

    // ── Atajos de rango ───────────────────────────────────────────

    setRango(rango: 'hoy' | 'semana' | 'mes'): void {
        const hoy = new Date();
        this.filtroHasta = this.hoy;

        if (rango === 'hoy') {
            this.filtroDesde = this.hoy;
        } else if (rango === 'semana') {
            const d = new Date(hoy);
            d.setDate(d.getDate() - 6);
            this.filtroDesde = d.toISOString().split('T')[0];
        } else {
            this.filtroDesde = hoy.getFullYear() + '-'
                + String(hoy.getMonth() + 1).padStart(2, '0') + '-01';
        }
    }

    // ── Carga de reporte ──────────────────────────────────────────

    cargarReporte(): void {
        if (!this.filtroDesde || !this.filtroHasta) return;
        this.cargando = true;
        this.error = '';
        this.errorPlan = false;
        this.reporte = null;

        this.reporteService.obtenerReporte(this.empresaId, this.filtroDesde, this.filtroHasta)
            .subscribe({
                next: (data) => {
                    this.reporte = data;
                    this.cargando = false;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    this.cargando = false;
                    const msg: string = err.error?.message ?? '';
                    if (err.status === 402 || msg.toLowerCase().includes('plan')) {
                        this.errorPlan = true;
                    } else {
                        this.error = msg || 'Error al cargar el reporte.';
                    }
                    this.cdr.markForCheck();
                }
            });
    }

    // ── Descargas ─────────────────────────────────────────────────

    descargarPdf(): void {
        this.descargando = true;
        this.reporteService.descargarPdf(this.empresaId, this.filtroDesde, this.filtroHasta);
        setTimeout(() => { this.descargando = false; this.cdr.markForCheck(); }, 3000);
    }

    descargarExcel(): void {
        this.descargando = true;
        this.reporteService.descargarExcel(this.empresaId, this.filtroDesde, this.filtroHasta);
        setTimeout(() => { this.descargando = false; this.cdr.markForCheck(); }, 3000);
    }
}