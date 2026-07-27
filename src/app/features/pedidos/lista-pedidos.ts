import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PedidoService } from './services/pedido';
import { AuthService } from '../../core/services/auth.service';
import { PedidoResponse } from '../../shared/models/pedido.model';

@Component({
  selector: 'app-lista-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-pedidos.html',
  styleUrls: ['./lista-pedidos.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaPedidos implements OnInit {

  empresaId!: number;
  pedidos: PedidoResponse[] = [];
  pedidosFiltrados: PedidoResponse[] = [];
  cargando = false;
  today: Date = new Date();

  // Filtros
  estadoSeleccionado = 'TODOS';
  metodoPagoFiltro = 'TODOS';
  busqueda = '';

  // Stats
  totalVentasHoy = 0;
  totalVentasMes = 0;
  comandasAbiertas = 0;
  pedidosPagadosHoy = 0;
  ventasEfectivo = 0;
  ventasTarjeta = 0;
  ventasNequi = 0;
  ventasMercadoPago = 0;

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    const empresaId = this.authService.getEmpresaId();
    if (!empresaId) { this.router.navigate(['/login']); return; }
    this.empresaId = Number(empresaId);
    this.cargarTodos();
  }

  cargarTodos(): void {
    this.cargando = true;
    const estados = ['ABIERTO', 'PAGADO'];
    let resultados: PedidoResponse[] = [];
    let completados = 0;

    estados.forEach(estado => {
      this.pedidoService.listar(this.empresaId, estado).subscribe({
        next: (data) => {
          resultados = [...resultados, ...(data ?? [])];
          completados++;
          if (completados === estados.length) {
            this.pedidos = resultados.sort((a, b) => b.id - a.id);
            this.procesarEstadisticas();
            this.aplicarFiltros();
            this.cargando = false;
            this.cdr.markForCheck();
          }
        },
        error: () => { completados++; }
      });
    });
  }

  private procesarEstadisticas(): void {
    const hoy = new Date().toDateString();
    const mes = new Date().getMonth();
    const anio = new Date().getFullYear();

    const pagadosHoy = this.pedidos.filter(p => {
      if (p.estado !== 'PAGADO') return false;
      const f = p.fechaCierre ? new Date(p.fechaCierre) : new Date(p.fechaApertura);
      return f.toDateString() === hoy;
    });

    const pagadosMes = this.pedidos.filter(p => {
      if (p.estado !== 'PAGADO') return false;
      const f = p.fechaCierre ? new Date(p.fechaCierre) : new Date(p.fechaApertura);
      return f.getMonth() === mes && f.getFullYear() === anio;
    });

    this.totalVentasHoy = pagadosHoy.reduce((a, p) => a + p.total, 0);
    this.totalVentasMes = pagadosMes.reduce((a, p) => a + p.total, 0);
    this.pedidosPagadosHoy = pagadosHoy.length;
    this.comandasAbiertas = this.pedidos.filter(p => p.estado === 'ABIERTO').length;

    this.ventasEfectivo = pagadosHoy.filter(p => p.metodoPago === 'EFECTIVO').reduce((a, p) => a + p.total, 0);
    this.ventasTarjeta = pagadosHoy.filter(p => p.metodoPago === 'TARJETA').reduce((a, p) => a + p.total, 0);
    this.ventasNequi = pagadosHoy.filter(p => p.metodoPago === 'NEQUI').reduce((a, p) => a + p.total, 0);
    this.ventasMercadoPago = pagadosHoy.filter(p => p.metodoPago === 'MERCADOPAGO' || p.metodoPago === 'TARJETA_MP').reduce((a, p) => a + p.total, 0);
  }

  aplicarFiltros(): void {
    this.pedidosFiltrados = this.pedidos.filter(p => {
      const estado = this.estadoSeleccionado === 'TODOS' || p.estado === this.estadoSeleccionado;
      const metodo = this.metodoPagoFiltro === 'TODOS' || (p.metodoPago ?? '') === this.metodoPagoFiltro;
      const busca = !this.busqueda ||
        p.mesa.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        p.id.toString().includes(this.busqueda);
      return estado && metodo && busca;
    });
    this.cdr.markForCheck();
  }

  verDetalle(pedido: PedidoResponse): void {
    if (pedido.estado !== 'ABIERTO') return;
    this.router.navigate(['/mesas/detalle', pedido.id]);
  }

  restaurar(pedido: PedidoResponse): void {
    if (!confirm(`¿Restaurar el pedido #${pedido.id} de ${pedido.mesa}? Volverá a estar ABIERTO.`)) return;
    this.pedidoService.restaurarPedido(this.empresaId, pedido.id).subscribe({
      next: () => { this.cargarTodos(); },
      error: (err) => alert('No se pudo restaurar: ' + (err.error?.message || err.message))
    });
  }

  trackByPedido(_: number, p: PedidoResponse): number { return p.id; }

  getBadgeEstado(estado: string): string {
    switch (estado) {
      case 'PAGADO': return 'badge-pagado';
      case 'ABIERTO': return 'badge-abierto';
      case 'CANCELADO': return 'badge-cancelado';
      default: return 'badge-secondary';
    }
  }

  getIconoMetodo(metodo?: string | null): string {
    switch (metodo) {
      case 'EFECTIVO': return 'bi-cash-coin';
      case 'TARJETA': return 'bi-credit-card';
      case 'NEQUI': return 'bi-phone';
      case 'MERCADOPAGO': return 'bi-bag-check';
      default: return 'bi-dash';
    }
  }

  getLabelMetodo(metodo?: string | null): string {
    switch (metodo) {
      case 'EFECTIVO': return 'Efectivo';
      case 'TARJETA': return 'Tarjeta';
      case 'NEQUI': return 'Nequi';
      case 'MERCADOPAGO': return 'Mercado Pago';
      default: return '—';
    }
  }
}