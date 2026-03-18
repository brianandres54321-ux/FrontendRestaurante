import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SeccionResponse } from '../../../shared/models/response/seccion-response.model';

@Injectable({ providedIn: 'root' })
export class SeccionesService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  private url(empresaId: number) {
    return `${this.baseUrl}/empresas/${empresaId}/secciones`;
  }

  listar(empresaId: number): Observable<SeccionResponse[]> {
    return this.http.get<SeccionResponse[]>(this.url(empresaId));
  }

  crear(empresaId: number, nombre: string): Observable<SeccionResponse> {
    return this.http.post<SeccionResponse>(this.url(empresaId), { nombre });
  }

  actualizar(empresaId: number, id: number, nombre: string): Observable<SeccionResponse> {
    return this.http.put<SeccionResponse>(`${this.url(empresaId)}/${id}`, { nombre });
  }

  eliminar(empresaId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url(empresaId)}/${id}`);
  }
}