import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MesasService } from '../services/mesa';
import { ProductoService } from '../../productos/services/producto';
import { AuthService } from '../../../core/services/auth.service';
import { PagoService } from '../../pagos/services/pago';
import { CuponService } from '../../cupon/services/cupon';
import { PedidoResponse, ProductoResponse, MesaResponse, PedidoItemResponse } from '../../../shared/models';
import { Cupon, ValidarCuponResponse } from '../../../shared/models';
import { ModalProductoComponent } from './modal-producto';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-detalle-mesa',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalProductoComponent],
  templateUrl: './detalle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./detalle.scss']
})
export class DetalleMesaComponent implements OnInit, OnDestroy {
  private readonly baseUrl = environment.apiUrl;
  empresaId!: number;
  pedidoId!: number;
  mesa: MesaResponse | null = null;
  pedido: PedidoResponse | null = null;
  productos: ProductoResponse[] = [];
  mostrarModal: boolean = false;
  incluirPropina: boolean = false;
  metodoPago: string | null = null;
  procesandoPago: boolean = false;
  procesandoMercadoPago: boolean = false;

  // ── Cupones ───────────────────────────────────────────────────
  cupones: Cupon[] = [];
  cuponSeleccionadoId: number | null = null;   // id del select
  cuponAplicado: ValidarCuponResponse | null = null;
  validandoCupon = false;
  errorCupon = '';

  // Rol del usuario logueado
  get esMesero(): boolean {
    return this.authService.getRol()?.toUpperCase() === 'MESERO';
  }

  get permiteMercadoPago(): boolean {
    return this.authService.permiteMercadoPago;
  }

  // Calculadora de efectivo
  efectivoRecibido: number = 0;
  vueltas: number = 0;
  billetes: number[] = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000];

  // Polling Mercado Pago
  esperandoConfirmacionMP: boolean = false;
  private pollingInterval: any = null;

  constructor(
    private mesasService: MesasService,
    private productoService: ProductoService,
    private authService: AuthService,
    private pagoService: PagoService,
    private cuponService: CuponService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const empresa = this.authService.getEmpresaId();
    const pedidoParam = this.route.snapshot.paramMap.get('id');
    if (!empresa || !pedidoParam) { this.regresar(); return; }
    this.empresaId = Number(empresa);
    this.pedidoId = Number(pedidoParam);

    if (this.pedidoId !== 0) {
      this.cargarDatosPedido();
    } else {
      const mesaId = this.route.snapshot.queryParamMap.get('mesaId');
      if (!mesaId) { this.regresar(); return; }
      this.cargarMesaDePedido(Number(mesaId));
    }
    this.cargarProductos();
    this.cargarCupones();
  }

  ngOnDestroy(): void {
    this.detenerPolling();
  }

  // ── GETTERS ──────────────────────────────────────────────────

  get totalVisual(): number { return this.pedido?.total || 0; }

  get totalFinal(): number {
    const base = this.incluirPropina
      ? Math.round(this.totalVisual * 1.1)
      : this.totalVisual;
    if (this.cuponAplicado?.valido) {
      return Math.max(0, Math.round(base - this.cuponAplicado.descuento));
    }
    return base;
  }

  get esPedidoGrupal(): boolean { return !!this.pedido?.grupoId; }

  // ── CARGA ─────────────────────────────────────────────────────

  cargarDatosPedido(): void {
    this.mesasService.obtenerPedidoPorId(this.empresaId, this.pedidoId).subscribe({
      next: (pedido) => {
        this.pedido = { ...pedido, items: [...pedido.items] };
        this.cargarMesaDePedido(pedido.mesaId);
        this.cdr.markForCheck();
      },
      error: () => this.regresar()
    });
  }

  cargarMesaDePedido(mesaId: number | null): void {
    if (!mesaId) return;
    this.mesasService.obtenerMesas(this.empresaId).subscribe({
      next: (mesas) => {
        const mesaEncontrada = mesas.find(m => m.id === mesaId);
        if (mesaEncontrada) this.mesa = mesaEncontrada;
        this.cdr.markForCheck();
      }
    });
  }

  cargarProductos(): void {
    this.productoService.listar(this.empresaId).subscribe({
      next: data => { this.productos = data ?? []; this.cdr.markForCheck(); }
    });
  }

  cargarCupones(): void {
    if (this.esMesero) return;
    this.cuponService.listar(this.empresaId).subscribe({
      next: (data) => {
        // Solo mostrar cupones activos y vigentes
        const hoy = new Date().toISOString().split('T')[0];
        this.cupones = data.filter(c =>
          c.activo &&
          (!c.fechaInicio || c.fechaInicio <= hoy) &&
          (!c.fechaFin || c.fechaFin >= hoy) &&
          (c.usosMaximos === null || c.usosActuales < c.usosMaximos)
        );
        this.cdr.markForCheck();
      }
    });
  }

  // ── CUPONES ───────────────────────────────────────────────────

  onCuponSeleccionado(): void {
    this.cuponAplicado = null;
    this.errorCupon = '';

    if (!this.cuponSeleccionadoId || !this.pedido) {
      this.calcularVueltas();
      this.cdr.markForCheck();
      return;
    }

    const cupon = this.cupones.find(c => c.id === Number(this.cuponSeleccionadoId));
    if (!cupon) return;

    // Validar monto mínimo en el frontend para respuesta inmediata
    if (cupon.montoMinimo && this.totalVisual < cupon.montoMinimo) {
      this.errorCupon = `El pedido debe ser mínimo de $${cupon.montoMinimo.toLocaleString('es-CO')} para aplicar este cupón`;
      this.cuponSeleccionadoId = null;
      this.cdr.markForCheck();
      return;
    }

    this.validandoCupon = true;
    this.cuponService.validar(this.empresaId, cupon.codigo, this.pedido.id).subscribe({
      next: (res) => {
        this.validandoCupon = false;
        if (res.valido) {
          this.cuponAplicado = res;
          this.errorCupon = '';
        } else {
          this.errorCupon = res.mensaje;
          this.cuponSeleccionadoId = null;
        }
        this.calcularVueltas();
        this.cdr.markForCheck();
      },
      error: () => {
        this.validandoCupon = false;
        this.errorCupon = 'Error al validar el cupón.';
        this.cuponSeleccionadoId = null;
        this.cdr.markForCheck();
      }
    });
  }

  quitarCupon(): void {
    this.cuponAplicado = null;
    this.cuponSeleccionadoId = null;
    this.errorCupon = '';
    this.calcularVueltas();
    this.cdr.markForCheck();
  }

  labelCupon(c: Cupon): string {
    const descuento = c.tipo === 'PORCENTAJE'
      ? `${c.valor}% off`
      : `$${c.valor.toLocaleString('es-CO')} off`;
    return `${c.codigo} — ${descuento}${c.descripcion ? ' · ' + c.descripcion : ''}`;
  }

  // ── MÉTODO DE PAGO ────────────────────────────────────────────

  seleccionarMetodo(metodo: string | null): void {
    this.metodoPago = metodo;
    this.efectivoRecibido = 0;
    this.vueltas = 0;
    if (metodo === null) this.quitarCupon();
  }

  // ── CALCULADORA EFECTIVO ──────────────────────────────────────

  calcularVueltas(): void {
    this.vueltas = (this.efectivoRecibido || 0) - this.totalFinal;
  }

  usarBillete(valor: number): void {
    this.efectivoRecibido = valor;
    this.calcularVueltas();
  }

  // ── PRODUCTOS ─────────────────────────────────────────────────

  onProductoSeleccionado(event: { producto: ProductoResponse, cantidad: number }): void {
    const { producto, cantidad } = event;
    if (this.pedido) { this.procesarAgregarProducto(this.pedido.id, producto.id, cantidad); return; }
    const mesaId = this.route.snapshot.queryParamMap.get('mesaId');
    const grupoId = this.route.snapshot.queryParamMap.get('grupoId');
    if (!mesaId) return;
    this.mesasService.abrirPedido(
      this.empresaId, Number(mesaId), this.authService.getUsuarioId()!,
      grupoId ? Number(grupoId) : null
    ).subscribe({
      next: (nuevoPedido) => {
        this.pedido = nuevoPedido;
        this.procesarAgregarProducto(nuevoPedido.id, producto.id, cantidad);
        this.router.navigate(['/mesas/detalle', nuevoPedido.id]);
      }
    });
  }

  private procesarAgregarProducto(pedidoId: number, productoId: number, cantidad: number): void {
    const producto = this.productos.find(p => p.id === productoId);
    if (!producto || !this.pedido) return;
    const itemTemporal: PedidoItemResponse = {
      id: Date.now(), productoId: producto.id, productoNombre: producto.nombre,
      imagen: producto.imagen || '', cantidad, precioUnitario: producto.precioActual,
      subtotal: producto.precioActual * cantidad, notas: ''
    };
    this.pedido = {
      ...this.pedido,
      items: [...this.pedido.items, itemTemporal],
      total: this.pedido.total + itemTemporal.subtotal
    };
    this.mesasService.agregarProducto(this.empresaId, pedidoId, productoId, cantidad).subscribe({
      next: (pedidoActualizado) => {
        this.pedido = { ...pedidoActualizado, items: pedidoActualizado.items || [] };
        this.calcularVueltas();
        this.cargarProductos();
      },
      error: (err) => {
        this.pedido = {
          ...this.pedido!,
          items: this.pedido!.items.filter(i => i.id !== itemTemporal.id),
          total: this.pedido!.total - itemTemporal.subtotal
        };
        alert('Error: ' + (err.error?.message || 'No se pudo agregar el producto'));
      }
    });
  }

  eliminarProducto(itemId: number): void {
    if (!confirm('¿Desea eliminar este producto?')) return;
    this.mesasService.eliminarItemPedido(this.empresaId, itemId).subscribe({
      next: (pedidoActualizado) => {
        if (pedidoActualizado.estado === 'CANCELADO') {
          this.router.navigate(['/mesas']);
        } else {
          this.pedido = { ...pedidoActualizado, items: [...pedidoActualizado.items] };
          // Si hay cupón aplicado, re-validar por si el nuevo total no cumple el mínimo
          if (this.cuponAplicado) this.onCuponSeleccionado();
          this.calcularVueltas();
          this.cargarProductos();
          this.cdr.markForCheck();
        }
      }
    });
  }

  // ── PAGO ──────────────────────────────────────────────────────

  finalizarPago(): void {
    if (!this.pedido || this.procesandoPago) return;

    const metodo = this.metodoPago ?? 'EFECTIVO';
    const metodoLabel = metodo === 'EFECTIVO'
      ? `efectivo. Vueltas: $${this.vueltas.toLocaleString('es-CO')}`
      : metodo.toLowerCase();

    if (!confirm(`¿Confirmar pago de $${this.totalFinal.toLocaleString('es-CO')} con ${metodoLabel}?`)) return;

    this.procesandoPago = true;

    this.pagoService.registrarPago(
      this.empresaId,
      this.pedido.id,
      {
        metodo: metodo as 'EFECTIVO' | 'MERCADOPAGO',
        monto: this.totalFinal,
        codigoCupon: this.cuponAplicado?.valido ? this.cuponAplicado.codigo : undefined
      }
    ).subscribe({
      next: () => {
        this.procesandoPago = false;
        this.router.navigate(['/mesas']);
      },
      error: (err) => {
        this.procesandoPago = false;
        alert('Error al procesar el pago: ' + (err.error?.message || 'Servidor no disponible'));
      }
    });
  }

  // ── MERCADO PAGO ──────────────────────────────────────────────

  pagarConMercadoPago(): void {
    if (!this.pedido) { alert('No hay un pedido activo para pagar.'); return; }
    if (this.pedido.items.length === 0) { alert('El pedido no tiene productos.'); return; }
    if (this.procesandoMercadoPago) return;

    this.procesandoMercadoPago = true;

    this.mesasService.crearPreferenciaMercadoPago(this.empresaId, this.pedido.id).subscribe({
      next: (preferencia) => {
        this.procesandoMercadoPago = false;
        const urlPago = environment.production
          ? preferencia.initPoint
          : preferencia.sandboxInitPoint;
        window.open(urlPago, '_blank');
        this.iniciarPolling();
      },
      error: (err) => {
        this.procesandoMercadoPago = false;
        alert('Error al conectar con Mercado Pago: ' + (err.error?.message || 'Intenta de nuevo'));
      }
    });
  }

  // ── POLLING ───────────────────────────────────────────────────

  private iniciarPolling(): void {
    if (!this.pedido || this.pedido.id === 0) return;

    const pedidoIdReal = this.pedido.id;
    this.esperandoConfirmacionMP = true;

    let intentos = 0;
    const maxIntentos = 60;

    this.pollingInterval = setInterval(() => {
      intentos++;
      if (intentos > maxIntentos) { this.detenerPolling(); return; }

      const token = localStorage.getItem('token');
      if (!token) { this.detenerPolling(); this.router.navigate(['/login']); return; }

      this.mesasService.obtenerPedidoPorId(this.empresaId, pedidoIdReal).subscribe({
        next: (pedido) => {
          if (pedido.estado === 'PAGADO' || pedido.estado === 'CANCELADO') {
            this.detenerPolling();
            this.router.navigate(['/mesas']);
          }
        },
        error: (err) => {
          if (err.status === 401 || err.status === 403) {
            this.detenerPolling(); this.router.navigate(['/login']);
          }
          if (err.status === 404) {
            this.detenerPolling(); this.router.navigate(['/mesas']);
          }
        }
      });
    }, 5000);
  }

  private detenerPolling(): void {
    if (this.pollingInterval) { clearInterval(this.pollingInterval); this.pollingInterval = null; }
    this.esperandoConfirmacionMP = false;
    this.cdr.markForCheck();
  }

  // ── HELPERS ───────────────────────────────────────────────────

  regresar(): void { this.router.navigate(['/mesas']); }

  getImagenProducto(img?: string | null): string {
    if (!img) return 'assets/img/producto-default.png';
    if (img.startsWith('data:image') || img.startsWith('http')) return img;
    const imagenLimpia = img.startsWith('/') ? img.substring(1) : img;
    return `${this.baseUrl}/uploads/${imagenLimpia}`;
  }

  trackByItem(index: number): number { return index; }
}