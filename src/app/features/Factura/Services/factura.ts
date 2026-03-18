import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PedidoResponse, PagoResponse } from '../../../shared/models';

@Injectable({
    providedIn: 'root'
})
export class FacturaService {
    private readonly apiUrl = `${environment.apiUrl}/facturacion`;

    constructor(private http: HttpClient) { }

    crearFacturaYPaguar(pedidoId: number, monto: number, metodo: string, propina: number): Observable<PagoResponse> {
        return this.http.post<PagoResponse>(`${this.apiUrl}/pagar`, {
            pedidoId,
            monto,
            metodo,
            propina
        });
    }
}