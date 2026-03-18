import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PagoResponse, MercadoPagoPreferenciaResponse, RegistrarPagoRequest } from '../../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private url(empresaId: number): string {
    return `${this.baseUrl}/empresas/${empresaId}/pagos`;
  }

  // ── Pago manual (efectivo, tarjeta, nequi) ────────────────────

  registrarPago(
    empresaId: number,
    pedidoId: number,
    req: RegistrarPagoRequest
  ): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(
      `${this.url(empresaId)}/pedido/${pedidoId}`,
      req
    );
  }

  listarPorPedido(empresaId: number, pedidoId: number): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(
      `${this.url(empresaId)}/pedido/${pedidoId}`
    );
  }

  listarPorEmpresa(empresaId: number): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(this.url(empresaId));
  }

  // ── Mercado Pago ──────────────────────────────────────────────

  crearPreferenciaMercadoPago(
    empresaId: number,
    pedidoId: number
  ): Observable<MercadoPagoPreferenciaResponse> {
    return this.http.post<MercadoPagoPreferenciaResponse>(
      `${this.url(empresaId)}/mercadopago/preferencia`,
      {
        pedidoId,
        urlRetorno: `${window.location.origin}/pagos/resultado`
      }
    );
  }
}