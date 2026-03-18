import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

import {
  AbrirPedidoRequest,
  AgregarProductoRequest,
  RegistrarPagoRequest
} from '../../../shared/models/request';

import { PedidoResponse } from '../../../shared/models/response/pedido-response.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getUrl(empresaId: number): string {
    return `${this.baseUrl}/empresas/${empresaId}/pedidos`;
  }

  listar(empresaId: number, estado?: string): Observable<PedidoResponse[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<PedidoResponse[]>(this.getUrl(empresaId), { params }).pipe(
      map(pedidos => (pedidos ?? []).map(p => this.formatearPedido(p))),
      catchError(err => this.manejarError(err))
    );
  }

  obtener(empresaId: number, pedidoId: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.getUrl(empresaId)}/${pedidoId}`).pipe(
      map(pedido => this.formatearPedido(pedido)),
      catchError(err => this.manejarError(err))
    );
  }

  abrirPedido(empresaId: number, data: AbrirPedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.getUrl(empresaId)}/abrir`, data).pipe(
      catchError(err => this.manejarError(err))
    );
  }

  agregarProducto(empresaId: number, pedidoId: number, data: AgregarProductoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.getUrl(empresaId)}/${pedidoId}/productos`, data).pipe(
      map(pedido => this.formatearPedido(pedido)),
      catchError(err => this.manejarError(err))
    );
  }

  eliminarItemPedido(empresaId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.getUrl(empresaId)}/items/${itemId}`).pipe(
      catchError(err => this.manejarError(err))
    );
  }

  registrarPago(empresaId: number, pedidoId: number, data: RegistrarPagoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.getUrl(empresaId)}/${pedidoId}/pago`, data).pipe(
      catchError(err => this.manejarError(err))
    );
  }

  cerrarPedido(empresaId: number, pedidoId: number): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.getUrl(empresaId)}/${pedidoId}/cerrar`, {}).pipe(
      catchError(err => this.manejarError(err))
    );
  }

  // ✅ NUEVO — Restaurar pedido cancelado a ABIERTO
  restaurarPedido(empresaId: number, pedidoId: number): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.getUrl(empresaId)}/${pedidoId}/restaurar`, {}).pipe(
      map(pedido => this.formatearPedido(pedido)),
      catchError(err => this.manejarError(err))
    );
  }

  unirMesa(empresaId: number, pedidoId: number, mesaIdParaUnir: number): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(
      `${this.getUrl(empresaId)}/${pedidoId}/unir-mesa/${mesaIdParaUnir}`, {}
    ).pipe(catchError(err => this.manejarError(err)));
  }

  private formatearPedido(pedido: PedidoResponse): PedidoResponse {
    if (pedido && !pedido.items) pedido.items = [];
    return pedido;
  }

  private manejarError(error: any) {
    if (error.status === 403) console.error('ERROR 403: Acceso denegado.');
    else if (error.status === 404) console.error('ERROR 404: Ruta no encontrada.');
    return throwError(() => error);
  }
}