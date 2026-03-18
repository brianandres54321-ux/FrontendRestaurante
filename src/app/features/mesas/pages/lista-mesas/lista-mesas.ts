import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MesasService } from '../../services/mesa';
import { SeccionesService } from '../../../secciones/services/seccion';
import { AuthService } from '../../../../core/services/auth.service';

import { MesaResponse } from '../../../../shared/models/response/mesa-response.model';
import { SeccionResponse } from '../../../../shared/models/response/seccion-response.model';

@Component({
  selector: 'app-lista-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-mesas.html',
  styleUrl: './lista-mesas.scss'
})
export class ListaMesas implements OnInit {

  empresaId!: number;
  usuarioId!: number;
  mesas: MesaResponse[] = [];
  mesasFiltradas: MesaResponse[] = [];
  secciones: SeccionResponse[] = [];
  seccionSeleccionada: number | null = null;
  modoSeleccion: boolean = false;
  mesasSeleccionadas: number[] = [];

  constructor(
    private mesasService: MesasService,
    private seccionesService: SeccionesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Obtención crítica de IDs para evitar errores de autorización (401)
    const empresaId = this.authService.getEmpresaId();
    const usuarioId = this.authService.getUsuarioId();

    if (!empresaId || !usuarioId) {
      console.warn('Falta información de sesión (empresaId/usuarioId). Redirigiendo...');
      // Si falta info esencial, no intentamos cargar nada
      return;
    }

    this.empresaId = empresaId;
    this.usuarioId = usuarioId;
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.seccionesService.listar(this.empresaId).subscribe({
      next: (secciones) => {
        this.secciones = secciones ?? [];
        this.cargarMesas();
      },
      error: (err) => console.error('Error al cargar secciones', err)
    });
  }

  cargarMesas(): void {
    this.mesasService.obtenerMesas(this.empresaId).subscribe({
      next: (mesas) => {
        // 🔥 AGREGAMOS ESTA LÓGICA DE ORDENAMIENTO
        const mesasBase = mesas ?? [];

        this.mesas = mesasBase.sort((a, b) => {
          // Primero: Si pertenecen a un grupo, ponerlas juntas
          // Usamos 999999 o un número alto para las mesas sin grupo (null) para que vayan al final
          const grupoA = a.grupoId || 999999;
          const grupoB = b.grupoId || 999999;

          if (grupoA !== grupoB) {
            return grupoA - grupoB;
          }
          // Segundo: Si son del mismo grupo (o ambas no tienen grupo), ordenar por ID o Nombre
          return a.id - b.id;
        });

        this.filtrarPorSeccion();

        if (this.modoSeleccion) {
          this.mesasSeleccionadas = this.mesasSeleccionadas.filter(id =>
            this.mesas.find(m => m.id === id && m.estado === 'LIBRE')
          );
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar mesas', err)
    });
  }

  filtrarPorSeccion(): void {
    if (this.seccionSeleccionada === null || this.seccionSeleccionada === undefined) {
      this.mesasFiltradas = [...this.mesas];
    } else {
      const idBusqueda = Number(this.seccionSeleccionada);
      this.mesasFiltradas = this.mesas.filter(m => Number(m.seccionId) === idBusqueda);
    }
  }

  seleccionarMesa(mesa: MesaResponse): void {

    if (this.modoSeleccion) {
      this.seleccionarParaUnir(mesa.id);
      return;
    }

    if (mesa.estado === 'BLOQUEADA') return;

    this.mesasService.obtenerPedidoActivo(this.empresaId, mesa).subscribe({

      next: (pedido) => {

        if (pedido && pedido.id) {
          // 🔵 ya existe pedido
          this.router.navigate(['/mesas/detalle', pedido.id]);
        } else {

          // 🟢 mesa libre
          this.router.navigate(['/mesas/detalle', 0], {
            queryParams: {
              mesaId: mesa.id,
              grupoId: mesa.grupoId
            }
          });

        }

      },

      error: (err) => {

        if (err.message === 'MESA_LIBRE') {

          // 🟢 mesa libre
          this.router.navigate(['/mesas/detalle', 0], {
            queryParams: {
              mesaId: mesa.id,
              grupoId: mesa.grupoId
            }
          });

        } else {

          console.error('Error al verificar estado de la mesa:', err);

        }

      }

    });

  }

  private abrirNuevoPedido(mesa: MesaResponse): void {
    this.mesasService.abrirPedido(this.empresaId, mesa.id, this.usuarioId, mesa.grupoId).subscribe({
      next: (nuevoPedido) => {
        this.router.navigate(['/mesas/detalle', nuevoPedido.id]);
      },
      error: (err) => alert('No se pudo abrir el pedido: ' + (err.error?.message || 'Error del servidor'))
    });
  }

  // --- LÓGICA DE GRUPOS (UNIR/DESUNIR) ---

  toggleModoSeleccion(): void {
    this.modoSeleccion = !this.modoSeleccion;
    this.mesasSeleccionadas = [];
  }

  seleccionarParaUnir(mesaId: number): void {
    const mesa = this.mesas.find(m => m.id === mesaId);
    if (mesa?.estado === 'BLOQUEADA') return;

    const index = this.mesasSeleccionadas.indexOf(mesaId);
    if (index > -1) {
      this.mesasSeleccionadas.splice(index, 1);
    } else {
      this.mesasSeleccionadas.push(mesaId);
    }
  }

  confirmarUnion(): void {
    if (this.mesasSeleccionadas.length < 2) return;

    this.mesasService.unirMesas(this.empresaId, this.mesasSeleccionadas).subscribe({
      next: () => {
        this.modoSeleccion = false;
        this.mesasSeleccionadas = [];
        this.cargarMesas();
      },
      error: (err) => alert('Error al unir mesas: ' + (err.error?.message || 'Error desconocido'))
    });
  }

  confirmarDesunion(mesaId: number): void {
    if (confirm('¿Separar esta mesa del grupo?')) {
      this.mesasService.desunirMesa(this.empresaId, mesaId).subscribe({
        next: () => {
          this.modoSeleccion = false;
          this.mesasSeleccionadas = [];
          this.cargarMesas();
          // Opcional: un mensaje de éxito
          console.log('Mesas unidas y cuenta sincronizada');
        },
        error: (err) => alert('Error al desunir: ' + (err.error?.message || 'Error del servidor'))
      });
    }
  }

  esMismoGrupoQueAnterior(index: number): boolean {
    if (index === 0) return false;
    const actual = this.mesasFiltradas[index];
    const anterior = this.mesasFiltradas[index - 1];
    return !!(actual.grupoId && anterior.grupoId && actual.grupoId === anterior.grupoId);
  }

  esUltimaDelGrupo(mesa: MesaResponse, index: number): boolean {
    if (!mesa.grupoId) return true;
    const siguiente = this.mesasFiltradas[index + 1];
    return !siguiente || siguiente.grupoId !== mesa.grupoId;
  }

  trackByMesa(index: number, mesa: MesaResponse): number {
    return mesa.id;
  }

  obtenerNombreSeccion(mesa: MesaResponse): string {
    if (mesa.seccionNombre) return mesa.seccionNombre;
    const seccion = this.secciones.find(s => Number(s.id) === Number(mesa.seccionId));
    return seccion ? seccion.nombre : 'Sin sección';
  }


}