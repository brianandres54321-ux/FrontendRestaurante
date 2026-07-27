import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EmpresaResponse } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
    private baseUrl = environment.apiUrl;
    constructor(private http: HttpClient) { }

    miEmpresa(): Observable<EmpresaResponse> {
        return this.http.get<EmpresaResponse>(`${this.baseUrl}/empresas/mi-empresa`);
    }

    actualizar(data: { nombre: string; nitRut: string; plan: string }): Observable<EmpresaResponse> {
        return this.http.put<EmpresaResponse>(`${this.baseUrl}/empresas/mi-empresa`, data);
    }
}