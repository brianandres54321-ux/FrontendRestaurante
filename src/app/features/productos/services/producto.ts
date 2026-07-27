import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

import { environment } from '../../../../environments/environment'
import { ProductoRequest, ProductoResponse } from '../../../shared/models/producto.model'

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private readonly baseUrl = environment.apiUrl

  constructor(private http: HttpClient) { }

  listar(empresaId: number): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(
      `${this.baseUrl}/empresas/${empresaId}/productos`
    )
  }

  obtener(empresaId: number, id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(
      `${this.baseUrl}/empresas/${empresaId}/productos/${id}`
    )
  }

  crear(empresaId: number, data: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(
      `${this.baseUrl}/empresas/${empresaId}/productos`,
      data
    )
  }

  actualizar(
    empresaId: number,
    id: number,
    data: ProductoRequest
  ): Observable<ProductoResponse> {

    return this.http.put<ProductoResponse>(
      `${this.baseUrl}/empresas/${empresaId}/productos/${id}`,
      data
    )
  }
 
  eliminar(empresaId: number, id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/empresas/${empresaId}/productos/${id}`
    ) 
  }

  // 1. Para ver los productos que están en la "Papelera"
  listarInactivos(empresaId: number): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(
      `${this.baseUrl}/empresas/${empresaId}/productos/inactivos`
    );
  }

  // 2. Para sacar un producto de la papelera y volverlo a activar
  activar(empresaId: number, id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/empresas/${empresaId}/productos/${id}/activar`,
      {} // El cuerpo va vacío porque es un PATCH de estado
    );
  }
}