import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CierreCaja } from '../../../shared/models/index';

@Injectable({ providedIn: 'root' })
export class CierreCajaService {

    private readonly base = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private url(empresaId: number, sufijo = ''): string {
        return `${this.base}/empresas/${empresaId}/cierres${sufijo}`;
    }

    /** Preview del día — no guarda nada */
    preview(empresaId: number, fecha: string): Observable<CierreCaja> {
        const params = new HttpParams().set('fecha', fecha);
        return this.http.get<CierreCaja>(this.url(empresaId, '/preview'), { params });
    }

    /** Registra (o actualiza) la base de caja del día, antes de poder cerrar */
    registrarBase(empresaId: number, fecha: string, baseInicial: number): Observable<CierreCaja> {
        return this.http.put<CierreCaja>(this.url(empresaId, '/base'), { fecha, baseInicial });
    }

    /** Ejecuta y guarda el cierre */
    ejecutar(empresaId: number, fecha: string, notas: string): Observable<CierreCaja> {
        return this.http.post<CierreCaja>(this.url(empresaId), { fecha, notas });
    }

    /** Historial de cierres */
    historial(empresaId: number): Observable<CierreCaja[]> {
        return this.http.get<CierreCaja[]>(this.url(empresaId));
    }

    /** Detalle de un cierre (incluye pagos del día) */
    detalle(empresaId: number, cierreId: number): Observable<CierreCaja> {
        return this.http.get<CierreCaja>(this.url(empresaId, `/${cierreId}`));
    }
}