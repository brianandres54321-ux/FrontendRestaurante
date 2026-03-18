import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MesaResponse, PedidoResponse } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class MesasService {

  private readonly baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  private getUrlMesas(empresaId: number): string {
    return `${this.baseUrl}/empresas/${empresaId}/mesas`;
  }
  private getUrlPedidos(empresaId: number): string {
    return `${this.baseUrl}/empresas/${empresaId}/pedidos`;
  }
  private getUrlGrupos(empresaId: number): string {
    return `${this.baseUrl}/empresas/${empresaId}/mesas/grupos`;
  }

  // ── MESAS ─────────────────────────────────────────────────────

  obtenerMesas(empresaId: number): Observable<MesaResponse[]> {
    return this.http.get<MesaResponse[]>(this.getUrlMesas(empresaId));
  }

  obtenerPorSeccion(empresaId: number, seccionId: number): Observable<MesaResponse[]> {
    return this.http.get<MesaResponse[]>(`${this.getUrlMesas(empresaId)}/seccion/${seccionId}`);
  }

  crearMesa(empresaId: number, nombre: string, seccionId: number): Observable<MesaResponse> {
    return this.http.post<MesaResponse>(this.getUrlMesas(empresaId), { nombre, seccionId });
  }

  actualizarMesa(empresaId: number, id: number, nombre: string, seccionId: number): Observable<MesaResponse> {
    return this.http.put<MesaResponse>(`${this.getUrlMesas(empresaId)}/${id}`, { nombre, seccionId });
  }

  eliminarMesa(empresaId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.getUrlMesas(empresaId)}/${id}`);
  }

  // ── GRUPOS ────────────────────────────────────────────────────

  unirMesas(empresaId: number, mesasIds: number[]): Observable<any> {
    return this.http.post(`${this.getUrlGrupos(empresaId)}/unir`, { mesasIds });
  }

  desunirMesa(empresaId: number, mesaId: number): Observable<any> {
    return this.http.delete(`${this.getUrlGrupos(empresaId)}/desunir/${mesaId}`);
  }

  // ── PEDIDOS ───────────────────────────────────────────────────

  obtenerPedidoActivo(empresaId: number, mesa: MesaResponse): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse[]>(`${this.getUrlPedidos(empresaId)}?estado=ABIERTO`).pipe(
      map(pedidos => pedidos.find(p =>
        (p.mesaId && Number(p.mesaId) === Number(mesa.id)) ||
        (mesa.grupoId && p.grupoId && Number(p.grupoId) === Number(mesa.grupoId))
      )),
      switchMap(pedido => {
        if (!pedido) return throwError(() => new Error('MESA_LIBRE'));
        return this.obtenerPedidoPorId(empresaId, pedido.id);
      })
    );
  }

  abrirPedido(empresaId: number, mesaId: number, usuarioId: number, grupoId?: number | null): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.getUrlPedidos(empresaId)}/abrir`, {
      mesaId, usuarioId, grupoId: grupoId || null
    });
  }

  agregarProducto(empresaId: number, pedidoId: number, productoId: number, cantidad: number): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.getUrlPedidos(empresaId)}/${pedidoId}/productos`, {
      productoId, cantidad
    });
  }

  eliminarItemPedido(empresaId: number, itemId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
    return this.http.delete(`${this.baseUrl}/empresas/${empresaId}/pedidos/items/${itemId}`, { headers });
  }

  obtenerPedidoPorId(empresaId: number, pedidoId: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.baseUrl}/empresas/${empresaId}/pedidos/${pedidoId}`);
  }

  crearPreferenciaMercadoPago(empresaId: number, pedidoId: number): Observable<{ preferenceId: string; sandboxInitPoint: string; initPoint: string }> {
    return this.http.post<any>(
      `${this.baseUrl}/empresas/${empresaId}/pagos/mercadopago/preferencia`,
      { pedidoId, urlRetorno: `${window.location.origin}/pagos/resultado` }
    );
  }

  actualizarEstadoCocina(
    empresaId: number,
    pedidoId: number,
    estado: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO'
  ): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(
      `${this.getUrlPedidos(empresaId)}/${pedidoId}/cocina?estado=${estado}`,
      {}
    );
  }
}