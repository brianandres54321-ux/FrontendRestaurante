import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

import { environment } from '../../../../environments/environment'
import { CategoriaRequest, CategoriaResponse } from '../../../shared/models/categoria.model'

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private readonly baseUrl = environment.apiUrl

  constructor(private http: HttpClient) { }

  listar(empresaId: number): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(
      `${this.baseUrl}/empresas/${empresaId}/categorias`
    )
  }

  obtener(empresaId: number, id: number): Observable<CategoriaResponse> {
    return this.http.get<CategoriaResponse>(
      `${this.baseUrl}/empresas/${empresaId}/categorias/${id}`
    )
  }

  crear(empresaId: number, data: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.post<CategoriaResponse>(
      `${this.baseUrl}/empresas/${empresaId}/categorias`,
      data
    )
  }

  actualizar(
    empresaId: number,
    id: number,
    data: CategoriaRequest
  ): Observable<CategoriaResponse> {

    return this.http.put<CategoriaResponse>(
      `${this.baseUrl}/empresas/${empresaId}/categorias/${id}`,
      data
    )
  }

  eliminar(empresaId: number, id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/empresas/${empresaId}/categorias/${id}`
    )
  }
}