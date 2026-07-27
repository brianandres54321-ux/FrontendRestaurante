import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductoService } from '../productos/services/producto';
import { PedidoService } from './services/pedido';
import { PagoService } from '../pagos/services/pago';
import { AuthService } from '../../core/services/auth.service';
import { ModalProductoComponent } from '../mesas/components/modal-producto';

import { ProductoResponse, PedidoResponse, PedidoItemResponse } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-venta-directa',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalProductoComponent],
  templateUrl: './venta-directa.html',
  styleUrl: './venta-directa.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentaDirecta implements OnInit {

  empresaId!: number;
  productos: ProductoResponse[] = [];
  pedido: PedidoResponse | null = null;

  codigoEscaneado = '';
  procesandoEscaneo = false;

  metodoPago: string | null = null;
  efectivoRecibido = 0;
  vueltas = 0;

  procesandoPago = false;
  procesandoMercadoPago = false;
  verificandoMercadoPago = false;
  esperandoMercadoPago = false;

  constructor(
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private pagoService: PagoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();
    this.cargarProductos();
  }

  private cargarProductos(): void {
    this.productoService.listar(this.empresaId).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cdr.markForCheck();
      }
    });
  }

  get total(): number {
    return this.pedido?.total ?? 0;
  }

  // ── ESCÁNER DE CÓDIGO DE BARRAS ──────────────────────────────
  // Un lector de código de barras USB/Bluetooth funciona como teclado:
  // escribe el código rapidísimo y termina con Enter. Por eso basta con
  // un input normal escuchando (keyup.enter).

  escanear(): void {
    const codigo = this.codigoEscaneado.trim();
    this.codigoEscaneado = '';
    if (!codigo || this.procesandoEscaneo) return;

    const producto = this.productos.find(p => p.codigoBarras && p.codigoBarras === codigo);
    if (!producto) {
      alert(`No encontramos ningún producto con el código "${codigo}".`);
      return;
    }

    this.procesandoEscaneo = true;
    this.onProductoSeleccionado({ producto, cantidad: 1 }, () => {
      this.procesandoEscaneo = false;
      this.cdr.markForCheck();
    });
  }

  // ── PRODUCTOS ─────────────────────────────────────────────────

  onProductoSeleccionado(event: { producto: ProductoResponse; cantidad: number }, alTerminar?: () => void): void {
    const { producto, cantidad } = event;

    if (this.pedido) {
      this.procesarAgregarProducto(this.pedido.id, producto.id, cantidad, alTerminar);
      return;
    }

    this.pedidoService.abrirVentaDirecta(this.empresaId, {
      usuarioId: this.authService.getUsuarioId()
    }).subscribe({
      next: (nuevoPedido) => {
        this.pedido = nuevoPedido;
        this.procesarAgregarProducto(nuevoPedido.id, producto.id, cantidad, alTerminar);
      },
      error: (err) => {
        alert('No se pudo iniciar la venta: ' + (err.error?.message || 'Intenta de nuevo'));
        alTerminar?.();
      }
    });
  }

  private procesarAgregarProducto(pedidoId: number, productoId: number, cantidad: number, alTerminar?: () => void): void {
    this.pedidoService.agregarProducto(this.empresaId, pedidoId, { productoId, cantidad }).subscribe({
      next: (pedidoActualizado) => {
        this.pedido = pedidoActualizado;
        this.calcularVueltas();
        this.cargarProductos();
        this.cdr.markForCheck();
        alTerminar?.();
      },
      error: (err) => {
        alert('Error: ' + (err.error?.message || 'No se pudo agregar el producto'));
        alTerminar?.();
      }
    });
  }

  // Agrega 1 unidad más de un producto que ya está en el carrito
  sumarUnidad(item: PedidoItemResponse): void {
    if (!this.pedido) return;
    this.procesarAgregarProducto(this.pedido.id, item.productoId, 1);
  }

  // Quita 1 unidad; si era la última, elimina la línea completa
  restarUnidad(item: PedidoItemResponse): void {
    if (!this.pedido) return;
    this.pedidoService.reducirCantidadItem(this.empresaId, item.id, { cantidad: 1 }).subscribe({
      next: (pedidoActualizado) => {
        this.pedido = pedidoActualizado;
        this.calcularVueltas();
        this.cargarProductos();
        this.cdr.markForCheck();
      },
      error: (err) => alert('Error: ' + (err.error?.message || 'No se pudo actualizar la cantidad'))
    });
  }

  // Quita todas las unidades de esa línea de una vez
  quitarProducto(item: PedidoItemResponse): void {
    if (!this.pedido || !confirm(`¿Quitar las ${item.cantidad} unidad(es) de "${item.productoNombre}"?`)) return;
    this.pedidoService.eliminarItemPedido(this.empresaId, item.id).subscribe({
      next: () => {
        this.pedidoService.obtener(this.empresaId, this.pedido!.id).subscribe({
          next: (pedidoActualizado) => {
            this.pedido = pedidoActualizado;
            this.calcularVueltas();
            this.cargarProductos();
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  // ── VENTA ─────────────────────────────────────────────────────

  cancelarVenta(): void {
    if (!this.pedido) return;
    if (!confirm('¿Cancelar esta venta? Se perderán los productos agregados.')) return;
    this.pedidoService.cancelarPedido(this.empresaId, this.pedido.id).subscribe({
      next: () => this.reiniciarVenta(),
      error: (err) => alert('No se pudo cancelar: ' + (err.error?.message || 'Intenta de nuevo'))
    });
  }

  private reiniciarVenta(): void {
    this.pedido = null;
    this.metodoPago = null;
    this.efectivoRecibido = 0;
    this.vueltas = 0;
    this.esperandoMercadoPago = false;
    this.cargarProductos();
    this.cdr.markForCheck();
  }

  // ── MÉTODO DE PAGO ────────────────────────────────────────────

  seleccionarMetodo(metodo: string | null): void {
    this.metodoPago = metodo;
    this.efectivoRecibido = 0;
    this.vueltas = 0;
  }

  calcularVueltas(): void {
    this.vueltas = (this.efectivoRecibido || 0) - this.total;
  }

  usarBillete(valor: number): void {
    this.efectivoRecibido = valor;
    this.calcularVueltas();
  }

  // ── PAGO EFECTIVO ─────────────────────────────────────────────

  finalizarPago(): void {
    if (!this.pedido || this.procesandoPago) return;

    const metodo = this.metodoPago ?? 'EFECTIVO';
    const metodoLabel = metodo === 'EFECTIVO'
      ? `efectivo. Vueltas: $${this.vueltas.toLocaleString('es-CO')}`
      : metodo.toLowerCase();

    if (!confirm(`¿Confirmar cobro de $${this.total.toLocaleString('es-CO')} con ${metodoLabel}?`)) return;

    this.procesandoPago = true;

    this.pagoService.registrarPago(this.empresaId, this.pedido.id, {
      metodo: metodo as 'EFECTIVO' | 'MERCADOPAGO',
      monto: this.total
    }).subscribe({
      next: () => {
        this.procesandoPago = false;
        alert('¡Venta cobrada con éxito!');
        this.reiniciarVenta();
      },
      error: (err) => {
        this.procesandoPago = false;
        alert('Error al procesar el pago: ' + (err.error?.message || 'Servidor no disponible'));
      }
    });
  }

  // ── MERCADO PAGO ──────────────────────────────────────────────

  pagarConMercadoPago(): void {
    if (!this.pedido || this.pedido.items.length === 0) {
      alert('Agrega productos antes de cobrar.');
      return;
    }
    if (this.procesandoMercadoPago) return;

    this.procesandoMercadoPago = true;

    this.pagoService.crearPreferenciaMercadoPago(this.empresaId, this.pedido.id).subscribe({
      next: (preferencia) => {
        this.procesandoMercadoPago = false;
        this.esperandoMercadoPago = true;
        const urlPago = environment.production ? preferencia.initPoint : preferencia.sandboxInitPoint;
        window.open(urlPago, '_blank');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.procesandoMercadoPago = false;
        alert('Error al conectar con Mercado Pago: ' + (err.error?.message || 'Intenta de nuevo'));
      }
    });
  }

  verificarPagoMercadoPago(): void {
    if (!this.pedido || this.verificandoMercadoPago) return;
    this.verificandoMercadoPago = true;

    this.pedidoService.obtener(this.empresaId, this.pedido.id).subscribe({
      next: (pedidoActualizado) => {
        this.verificandoMercadoPago = false;
        if (pedidoActualizado.estado === 'PAGADO') {
          alert('¡Pago confirmado!');
          this.reiniciarVenta();
        } else {
          alert('Todavía no vemos el pago confirmado. Intenta de nuevo en unos segundos.');
        }
        this.cdr.markForCheck();
      },
      error: () => { this.verificandoMercadoPago = false; }
    });
  }
}

