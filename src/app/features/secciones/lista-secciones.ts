import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeccionesService } from './services/seccion';
import { ToastService } from '../../shared/services/toast.service';
import { MesasService } from '../mesas/services/mesa';
import { AuthService } from '../../core/services/auth.service';
import { SeccionResponse } from '../../shared/models/seccion.model';
import { MesaResponse } from '../../shared/models/mesa.model';

@Component({
  selector: 'app-lista-secciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-secciones.html',
  styleUrls: ['./lista-secciones.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaSecciones implements OnInit {

  empresaId!: number;
  secciones: SeccionResponse[] = [];
  mesas: MesaResponse[] = [];
  seccionActiva: number | null = null;
  cargando = false;

  // Modal sección
  modalSeccion = false;
  editandoSeccion: SeccionResponse | null = null;
  formSeccion = { nombre: '' };
  errorSeccion = '';
  guardandoSeccion = false;

  // Modal mesa
  modalMesa = false;
  editandoMesa: MesaResponse | null = null;
  formMesa = { nombre: '', seccionId: 0 };
  errorMesa = '';
  guardandoMesa = false;

  constructor(
    private seccionesService: SeccionesService,
    private mesasService: MesasService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.authService.getEmpresaId();
    if (!id) return;
    this.empresaId = id;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.seccionesService.listar(this.empresaId).subscribe({
      next: (s) => {
        this.secciones = s ?? [];
        if (!this.seccionActiva && this.secciones.length > 0) {
          this.seccionActiva = this.secciones[0].id;
        }
        this.cargarMesas();
      }
    });
  }

  cargarMesas(): void {
    this.mesasService.obtenerMesas(this.empresaId).subscribe({
      next: (m) => {
        this.mesas = m ?? [];
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => { this.cargando = false; this.cdr.markForCheck(); }
    });
  }

  mesasDe(seccionId: number): MesaResponse[] {
    return this.mesas.filter(m => Number(m.seccionId) === Number(seccionId));
  }

  get seccionActivaObj(): SeccionResponse | null {
    return this.secciones.find(s => s.id === this.seccionActiva) ?? null;
  }

  // ── SECCIONES ─────────────────────────────────────────────────

  abrirCrearSeccion(): void {
    this.editandoSeccion = null;
    this.formSeccion = { nombre: '' };
    this.errorSeccion = '';
    this.modalSeccion = true;
    this.cdr.markForCheck();
  }

  abrirEditarSeccion(s: SeccionResponse): void {
    this.editandoSeccion = s;
    this.formSeccion = { nombre: s.nombre };
    this.errorSeccion = '';
    this.modalSeccion = true;
    this.cdr.markForCheck();
  }

  guardarSeccion(): void {
    if (!this.formSeccion.nombre.trim()) { this.errorSeccion = 'El nombre es obligatorio.'; return; }
    this.guardandoSeccion = true;

    const obs = this.editandoSeccion
      ? this.seccionesService.actualizar(this.empresaId, this.editandoSeccion.id, this.formSeccion.nombre)
      : this.seccionesService.crear(this.empresaId, this.formSeccion.nombre);

    obs.subscribe({
      next: () => { this.guardandoSeccion = false; this.modalSeccion = false; this.cargar(); },
      error: (e) => { this.guardandoSeccion = false; this.errorSeccion = e.error?.message || 'Error al guardar.'; this.cdr.markForCheck(); }
    });
  }

  eliminarSeccion(s: SeccionResponse): void {
    const cant = this.mesasDe(s.id).length;
    const msg = cant > 0
      ? `La sección "${s.nombre}" tiene ${cant} mesa(s). ¿Eliminar de todas formas?`
      : `¿Eliminar la sección "${s.nombre}"?`;
    if (!confirm(msg)) return;

    this.seccionesService.eliminar(this.empresaId, s.id).subscribe({
      next: () => {
        if (this.seccionActiva === s.id) this.seccionActiva = null;
        this.cargar();
      },
      error: (e) => this.toastService.error('Error', e.error?.message || 'No se puede eliminar esta sección.')
    });
  }

  // ── MESAS ─────────────────────────────────────────────────────

  abrirCrearMesa(): void {
    this.editandoMesa = null;
    this.formMesa = { nombre: '', seccionId: this.seccionActiva ?? this.secciones[0]?.id ?? 0 };
    this.errorMesa = '';
    this.modalMesa = true;
    this.cdr.markForCheck();
  }

  abrirEditarMesa(m: MesaResponse): void {
    this.editandoMesa = m;
    this.formMesa = { nombre: m.nombre, seccionId: m.seccionId };
    this.errorMesa = '';
    this.modalMesa = true;
    this.cdr.markForCheck();
  }

  guardarMesa(): void {
    if (!this.formMesa.nombre.trim()) { this.errorMesa = 'El nombre es obligatorio.'; return; }
    if (!this.formMesa.seccionId) { this.errorMesa = 'Selecciona una sección.'; return; }
    this.guardandoMesa = true;

    const obs = this.editandoMesa
      ? this.mesasService.actualizarMesa(this.empresaId, this.editandoMesa.id, this.formMesa.nombre, this.formMesa.seccionId)
      : this.mesasService.crearMesa(this.empresaId, this.formMesa.nombre, this.formMesa.seccionId);

    obs.subscribe({
      next: () => { this.guardandoMesa = false; this.modalMesa = false; this.cargarMesas(); },
      error: (e) => {
        this.guardandoMesa = false;
        const msg = e.error?.message || 'Error al guardar.';
        // Error de límite de plan (402) — mensaje más visible
        if (e.status === 402) {
          this.modalMesa = false;
          this.toastService.plan(msg);
        } else {
          this.errorMesa = msg;
        }
        this.cdr.markForCheck();
      }
    });
  }

  eliminarMesa(m: MesaResponse): void {
    if (m.estado === 'OCUPADA') { this.toastService.error('Mesa ocupada', 'No puedes eliminar una mesa con pedido activo.'); return; }
    if (!confirm(`¿Eliminar la mesa "${m.nombre}"?`)) return;

    this.mesasService.eliminarMesa(this.empresaId, m.id).subscribe({
      next: () => this.cargarMesas(),
      error: (e) => this.toastService.error('Error', e.error?.message || 'No se puede eliminar esta mesa.')
    });
  }

  getBadgeEstado(estado: string): string {
    switch (estado) {
      case 'LIBRE': return 'estado-libre';
      case 'OCUPADA': return 'estado-ocupada';
      case 'BLOQUEADA': return 'estado-bloqueada';
      default: return '';
    }
  }

  seleccionarSeccion(id: number): void {
    this.seccionActiva = id;
    this.cdr.markForCheck();
  }

  trackById(_: number, item: any): number { return item.id; }
}