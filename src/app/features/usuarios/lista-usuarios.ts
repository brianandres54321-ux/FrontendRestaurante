import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from './services/usuario';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../shared/models/usuario.model';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-usuarios.html',
  styleUrls: ['./lista-usuarios.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaUsuarios implements OnInit {

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  busqueda = '';
  rolFiltro = 'TODOS';
  cargando = false;

  // Modal
  mostrarModal = false;
  editando: Usuario | null = null;
  guardando = false;
  errorModal = '';

  // Formulario
  form: Usuario = this.formVacio();

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.usuarios = data ?? [];
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => { this.cargando = false; this.cdr.markForCheck(); }
    });
  }

  aplicarFiltros(): void {
    this.usuariosFiltrados = this.usuarios.filter(u => {
      const rol = this.rolFiltro === 'TODOS' || u.rol === this.rolFiltro;
      const busca = !this.busqueda ||
        u.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        u.username.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(this.busqueda.toLowerCase());
      return rol && busca;
    });
    this.cdr.markForCheck();
  }

  // ── MODAL ──────────────────────────────────────────────────────

  abrirCrear(): void {
    this.editando = null;
    this.form = this.formVacio();
    this.errorModal = '';
    this.mostrarModal = true;
    this.cdr.markForCheck();
  }

  abrirEditar(u: Usuario): void {
    this.editando = u;
    this.form = { ...u, password: '' }; // No prellenar password
    this.errorModal = '';
    this.mostrarModal = true;
    this.cdr.markForCheck();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.editando = null;
    this.errorModal = '';
    this.cdr.markForCheck();
  }

  guardar(): void {
    if (!this.form.nombre?.trim()) { this.errorModal = 'El nombre es obligatorio.'; return; }
    if (!this.form.username?.trim()) { this.errorModal = 'El usuario es obligatorio.'; return; }
    if (!this.form.email?.trim()) { this.errorModal = 'El email es obligatorio.'; return; }
    if (!this.editando && !this.form.password?.trim()) { this.errorModal = 'La contraseña es obligatoria.'; return; }

    this.guardando = true;
    this.errorModal = '';

    const obs = this.editando
      ? this.usuarioService.actualizar(this.editando.id!, this.form)
      : this.usuarioService.crear(this.form);

    obs.subscribe({
      next: () => {
        this.guardando = false;
        this.toastService.exito(
          this.editando ? 'Usuario actualizado' : 'Usuario creado',
          this.editando ? 'Los cambios se guardaron correctamente.' : 'El usuario ya puede iniciar sesión.'
        );
        this.cerrarModal();
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        const msg = err.error?.message || 'Error al guardar el usuario.';
        if (err.status === 402) {
          this.cerrarModal();
          this.toastService.plan(msg);
        } else {
          this.errorModal = msg;
        }
        this.cdr.markForCheck();
      }
    });
  }

  // ── ACCIONES ───────────────────────────────────────────────────

  toggleActivo(u: Usuario): void {
    const accion = u.activo
      ? this.usuarioService.desactivar(u.id!)
      : this.usuarioService.activar(u.id!);

    accion.subscribe({
      next: () => this.cargar(),
      error: (err) => this.toastService.error('Error', err.error?.message || 'Error al cambiar estado.')
    });
  }

  // ── HELPERS ───────────────────────────────────────────────────

  private formVacio(): Usuario {
    return { nombre: '', username: '', email: '', password: '', rol: 'MESERO', activo: true };
  }

  getBadgeRol(rol: string): string {
    switch (rol) {
      case 'ADMIN': return 'badge-admin';
      case 'CAJERO': return 'badge-cajero';
      case 'MESERO': return 'badge-mesero';
      default: return 'badge-secondary';
    }
  }

  get usuariosActivos(): number { return this.usuarios.filter(u => u.activo).length; }
  get usuariosInactivos(): number { return this.usuarios.filter(u => !u.activo).length; }

  trackBy(_: number, u: Usuario): number { return u.id!; }
}