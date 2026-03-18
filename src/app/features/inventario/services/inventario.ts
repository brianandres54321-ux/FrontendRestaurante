import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

import { environment } from '../../../../environments/environment'
import { InventarioRequest } from '../../../shared/models/request/inventario-request.model'
import { InventarioResponse } from '../../../shared/models/response/inventario-response.model'

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private readonly baseUrl = environment.apiUrl

  constructor(private http: HttpClient) { }

  listar(empresaId: number): Observable<InventarioResponse[]> {
    return this.http.get<InventarioResponse[]>(
      `${this.baseUrl}/empresas/${empresaId}/inventario`
    )
  }

  obtener(empresaId: number, productoId: number): Observable<InventarioResponse> {
    return this.http.get<InventarioResponse>(
      `${this.baseUrl}/empresas/${empresaId}/inventario/producto/${productoId}`
    )
  }

  crear(empresaId: number, data: InventarioRequest): Observable<InventarioResponse> {
    return this.http.post<InventarioResponse>(
      `${this.baseUrl}/empresas/${empresaId}/inventario`,
      data
    )
  }

  actualizar(
    empresaId: number,
    productoId: number,
    data: InventarioRequest
  ): Observable<InventarioResponse> {

    return this.http.put<InventarioResponse>(
      `${this.baseUrl}/empresas/${empresaId}/inventario/producto/${productoId}`,
      data
    )
  }

  eliminar(empresaId: number, productoId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/empresas/${empresaId}/inventario/producto/${productoId}`
    )
  }
}