import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Cupon, CuponRequest, ValidarCuponResponse } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class CuponService {

    private readonly base = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private url(empresaId: number, sufijo = ''): string {
        return `${this.base}/empresas/${empresaId}/cupones${sufijo}`;
    }

    listar(empresaId: number): Observable<Cupon[]> {
        return this.http.get<Cupon[]>(this.url(empresaId));
    }

    crear(empresaId: number, req: CuponRequest): Observable<Cupon> {
        return this.http.post<Cupon>(this.url(empresaId), req);
    }

    actualizar(empresaId: number, id: number, req: CuponRequest): Observable<Cupon> {
        return this.http.put<Cupon>(this.url(empresaId, `/${id}`), req);
    }

    eliminar(empresaId: number, id: number): Observable<void> {
        return this.http.delete<void>(this.url(empresaId, `/${id}`));
    }

    /** Valida un cupón en el checkout sin aplicarlo todavía */
    validar(empresaId: number, codigo: string, pedidoId: number): Observable<ValidarCuponResponse> {
        const params = new HttpParams()
            .set('codigo', codigo)
            .set('pedidoId', pedidoId.toString());
        return this.http.get<ValidarCuponResponse>(this.url(empresaId, '/validar'), { params });
    }
}