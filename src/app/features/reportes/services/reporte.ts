  
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReporteVentas } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {

  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private url(empresaId: number, sufijo = ''): string {
    return `${this.base}/empresas/${empresaId}/reportes/ventas${sufijo}`;
  }

  /** Reporte como JSON */
  obtenerReporte(empresaId: number, desde: string, hasta: string): Observable<ReporteVentas> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<ReporteVentas>(this.url(empresaId), { params });
  }

  /** Descarga PDF — abre el navegador para guardar el archivo */
  descargarPdf(empresaId: number, desde: string, hasta: string): void {
    const token = localStorage.getItem('token') ?? '';
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    const urlFull = `${this.url(empresaId, '/pdf')}?${params.toString()}`;

    // Fetch manual para poder agregar el Authorization header
    fetch(urlFull, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `reporte-ventas-${desde}-${hasta}.pdf`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  }

  /** Descarga Excel */
  descargarExcel(empresaId: number, desde: string, hasta: string): void {
    const token = localStorage.getItem('token') ?? '';
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    const urlFull = `${this.url(empresaId, '/excel')}?${params.toString()}`;

    fetch(urlFull, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `reporte-ventas-${desde}-${hasta}.xlsx`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  }
}