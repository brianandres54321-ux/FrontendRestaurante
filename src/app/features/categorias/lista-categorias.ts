import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from './services/categoria';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { CategoriaResponse } from '../../shared/models/categoria.model';

@Component({
  selector: 'app-lista-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-categorias.html',
  styleUrl: './lista-categorias.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaCategorias implements OnInit {

  empresaId!: number;
  categorias: CategoriaResponse[] = [];
  cargando = false;

  modal = false;
  editando: CategoriaResponse | null = null;
  form = { nombre: '' };
  error = '';
  guardando = false;

  constructor(
    private categoriaService: CategoriaService,
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
    this.categoriaService.listar(this.empresaId).subscribe({
      next: (c) => {
        this.categorias = c ?? [];
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => { this.cargando = false; this.cdr.markForCheck(); }
    });
  }

  abrirCrear(): void {
    this.editando = null;
    this.form = { nombre: '' };
    this.error = '';
    this.modal = true;
    this.cdr.markForCheck();
  }

  abrirEditar(c: CategoriaResponse): void {
    this.editando = c;
    this.form = { nombre: c.nombre };
    this.error = '';
    this.modal = true;
    this.cdr.markForCheck();
  }

  guardar(): void {
    if (!this.form.nombre.trim()) { this.error = 'El nombre es obligatorio.'; return; }
    this.guardando = true;

    const obs = this.editando
      ? this.categoriaService.actualizar(this.empresaId, this.editando.id, { nombre: this.form.nombre })
      : this.categoriaService.crear(this.empresaId, { nombre: this.form.nombre });

    obs.subscribe({
      next: () => { this.guardando = false; this.modal = false; this.cargar(); },
      error: (e) => {
        this.guardando = false;
        this.error = e.error?.message || 'Error al guardar.';
        this.cdr.markForCheck();
      }
    });
  }

  eliminar(c: CategoriaResponse): void {
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"? Los productos que la usan quedarán sin categoría.`)) return;

    this.categoriaService.eliminar(this.empresaId, c.id).subscribe({
      next: () => this.cargar(),
      error: (e) => this.toastService.error('Error', e.error?.message || 'No se puede eliminar esta categoría.')
    });
  }

  trackById(_: number, item: CategoriaResponse): number { return item.id; }
}
