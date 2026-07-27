import {
    Component, OnInit, OnDestroy,
    ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MesasService } from '../mesas/services/mesa';
import { PedidoResponse, PedidoItemResponse } from '../../shared/models';
import { environment } from '../../../environments/environment';

type EstadoCocina = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO';

/** Extiende PedidoResponse con estado de ítems local (solo frontend) */
interface PedidoKDS extends PedidoResponse {
    estadoCocina?: EstadoCocina;
    itemsListos: Set<number>;   // ids de ítems ya marcados como listos
}

@Component({
    selector: 'app-cocina',
    standalone: true,
    imports: [CommonModule, DatePipe],
    templateUrl: './cocina.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./cocina.scss']
})
export class CocinaComponent implements OnInit, OnDestroy {

    pendientes: PedidoKDS[] = [];
    enPreparacion: PedidoKDS[] = [];
    listos: PedidoKDS[] = [];

    cargando = true;
    error = '';
    ultimaActualizacion: Date = new Date();
    pantallaCompleta = false;
    procesando = new Set<number>();
    expandidos = new Set<number>(); // ids de tarjetas listas expandidas

    private empresaId!: number;
    private pollingInterval: any = null;
    private readonly INTERVALO_MS = 15_000;

    constructor(
        private http: HttpClient,
        private mesasService: MesasService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.empresaId = this.authService.getEmpresaId();
        this.cargar();
        this.iniciarPolling();
    }

    ngOnDestroy(): void {
        this.detenerPolling();
        if (document.fullscreenElement) document.exitFullscreen();
    }

    // ── Carga ─────────────────────────────────────────────────────

    cargar(): void {
        const url = `${environment.apiUrl}/empresas/${this.empresaId}/pedidos?estado=ABIERTO`;
        this.http.get<PedidoResponse[]>(url).subscribe({
            next: (data) => {
                const pedidos = (data ?? [])
                    .filter(p => p.items && p.items.length > 0)
                    .sort((a, b) =>
                        new Date(a.fechaApertura).getTime() - new Date(b.fechaApertura).getTime()
                    );

                // Preservar ítems marcados localmente al refrescar
                const preservar = (nuevo: PedidoResponse): PedidoKDS => {
                    const existente = this.buscarEnListas(nuevo.id);
                    return {
                        ...nuevo,
                        estadoCocina: (nuevo as any).estadoCocina ?? existente?.estadoCocina ?? 'PENDIENTE',
                        itemsListos: existente?.itemsListos ?? new Set<number>()
                    };
                };

                const todos = pedidos.map(preservar);
                this.pendientes = todos.filter(p => !p.estadoCocina || p.estadoCocina === 'PENDIENTE');
                this.enPreparacion = todos.filter(p => p.estadoCocina === 'EN_PREPARACION');
                this.listos = todos.filter(p => p.estadoCocina === 'LISTO');

                this.cargando = false;
                this.error = '';
                this.ultimaActualizacion = new Date();
                this.cdr.markForCheck();
            },
            error: () => {
                this.cargando = false;
                this.error = 'Error al conectar con el servidor';
                this.cdr.markForCheck();
            }
        });
    }

    private buscarEnListas(id: number): PedidoKDS | undefined {
        return [...this.pendientes, ...this.enPreparacion, ...this.listos].find(p => p.id === id);
    }

    // ── Toggle ítem como listo ────────────────────────────────────

    toggleItem(pedido: PedidoKDS, item: PedidoItemResponse): void {
        if (pedido.estadoCocina === 'LISTO') return;

        const set = pedido.itemsListos;
        if (set.has(item.id)) {
            set.delete(item.id);
        } else {
            set.add(item.id);
        }

        // Si el pedido estaba PENDIENTE y tocaron un ítem → pasar a EN_PREPARACION
        if (pedido.estadoCocina === 'PENDIENTE' && set.size > 0) {
            this.moverEstado(pedido, 'EN_PREPARACION');
            return;
        }

        // Si todos los ítems están marcados → pasar automáticamente a LISTO
        const totalItems = pedido.items.reduce((acc, i) => acc + Number(i.cantidad), 0);
        const itemsUnicosMarcados = set.size;
        const todosListos = itemsUnicosMarcados >= pedido.items.length;

        if (todosListos && pedido.estadoCocina === 'EN_PREPARACION') {
            this.moverEstado(pedido, 'LISTO');
            return;
        }

        this.cdr.markForCheck();
    }

    itemEstaListo(pedido: PedidoKDS, itemId: number): boolean {
        return pedido.itemsListos.has(itemId);
    }

    contadorListos(pedido: PedidoKDS): number {
        return pedido.itemsListos.size;
    }

    // ── Cambiar estado del pedido completo ────────────────────────

    cambiarEstado(pedido: PedidoKDS, nuevoEstado: EstadoCocina): void {
        if (this.procesando.has(pedido.id)) return;

        if (nuevoEstado === 'PENDIENTE') pedido.itemsListos.clear();
        if (nuevoEstado === 'LISTO') {
            // Marcar todos los ítems automáticamente
            pedido.items.forEach(i => pedido.itemsListos.add(i.id));
        }

        this.moverEstado(pedido, nuevoEstado);
    }

    private moverEstado(pedido: PedidoKDS, nuevoEstado: EstadoCocina): void {
        this.procesando.add(pedido.id);
        this.cdr.markForCheck();

        this.mesasService.actualizarEstadoCocina(this.empresaId, pedido.id, nuevoEstado)
            .subscribe({
                next: () => {
                    this.quitarDeListas(pedido.id);
                    pedido.estadoCocina = nuevoEstado;

                    if (nuevoEstado === 'PENDIENTE') this.pendientes = [pedido, ...this.pendientes];
                    if (nuevoEstado === 'EN_PREPARACION') this.enPreparacion = [...this.enPreparacion, pedido];
                    if (nuevoEstado === 'LISTO') this.listos = [...this.listos, pedido];

                    this.procesando.delete(pedido.id);
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.procesando.delete(pedido.id);
                    this.cdr.markForCheck();
                }
            });
    }

    private quitarDeListas(id: number): void {
        this.pendientes = this.pendientes.filter(p => p.id !== id);
        this.enPreparacion = this.enPreparacion.filter(p => p.id !== id);
        this.listos = this.listos.filter(p => p.id !== id);
    }

    // ── Helpers ───────────────────────────────────────────────────

    esProcesando(id: number): boolean { return this.procesando.has(id); }

    get totalActivos(): number {
        return this.pendientes.length + this.enPreparacion.length + this.listos.length;
    }

    minutosTranscurridos(fecha: string | Date): number {
        return Math.floor((Date.now() - new Date(fecha).getTime()) / 60_000);
    }

    claseUrgencia(fecha: string | Date): string {
        const m = this.minutosTranscurridos(fecha);
        if (m >= 30) return 'urgente';
        if (m >= 15) return 'advertencia';
        return 'normal';
    }

    etiquetaTiempo(fecha: string | Date): string {
        const m = this.minutosTranscurridos(fecha);
        if (m === 0) return '< 1 min';
        if (m === 1) return '1 min';
        return `${m} min`;
    }

    togglePantallaCompleta(): void {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.pantallaCompleta = true;
        } else {
            document.exitFullscreen();
            this.pantallaCompleta = false;
        }
        this.cdr.markForCheck();
    }

    toggleExpandido(id: number): void {
        if (this.expandidos.has(id)) {
            this.expandidos.delete(id);
        } else {
            this.expandidos.add(id);
        }
        this.cdr.markForCheck();
    }

    estaExpandido(id: number): boolean {
        return this.expandidos.has(id);
    }

    private iniciarPolling(): void {
        this.pollingInterval = setInterval(() => this.cargar(), this.INTERVALO_MS);
    }

    private detenerPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    salir(): void { this.router.navigate(['/mesas']); }

    trackByPedido(_: number, p: PedidoKDS): number { return p.id; }
    trackByItem(_: number, i: PedidoItemResponse): number { return i.id; }
}