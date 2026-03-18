import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { jwtDecode } from 'jwt-decode'
import { environment } from '../../../environments/environment'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Router } from '@angular/router'

export interface LoginRequest {
  empresaId: number
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

interface TokenPayload {
  sub: string
  id: number
  empresaId: number
  empresaNombre: string
  rol: string
  plan: string   // ✅ plan incluido
  exp: number
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`
  private TOKEN_KEY = 'token'
  private decodedToken: TokenPayload | null = null

  constructor(private http: HttpClient, private router: Router) {
    this.cargarToken()
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data)
  }

  /**
   * Pide al backend un nuevo token con el plan actualizado
   * y lo guarda reemplazando el actual. Llamar después de cambiar el plan.
   */
  refreshToken(): Observable<void> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh-token`, {}).pipe(
      map((res) => {
        this.guardarToken(res.token)
      })
    )
  }

  guardarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
    this.decodedToken = jwtDecode<TokenPayload>(token)
  }

  obtenerToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) return null
    if (this.estaVencido(token)) { this.logout(); return null }
    return token
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    this.decodedToken = null
    this.router.navigate(['/login'])
  }

  estaAutenticado(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) return false
    if (this.estaVencido(token)) { this.logout(); return false }
    return true
  }

  private estaVencido(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token)
      return decoded.exp * 1000 < Date.now()
    } catch { return true }
  }

  private cargarToken(): void {
    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) { this.decodedToken = null; return }
    try {
      const decoded = jwtDecode<TokenPayload>(token)
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem(this.TOKEN_KEY)
        this.decodedToken = null
      } else {
        this.decodedToken = decoded
      }
    } catch { this.decodedToken = null }
  }

  // ── Getters ───────────────────────────────────────────────────
  getUsuarioId(): number { return this.decodedToken?.id ?? 0 }
  getEmpresaId(): number { return this.decodedToken?.empresaId ?? 0 }
  getRol(): string { return this.decodedToken?.rol ?? '' }
  getEmpresaNombre(): string { return this.decodedToken?.empresaNombre ?? '' }
  getUsername(): string { return this.decodedToken?.sub ?? '' }
  getPlan(): string { return this.decodedToken?.plan ?? 'BASICO' }

  // ── Helpers de plan ───────────────────────────────────────────
  get esPlanBasico(): boolean { return this.getPlan() === 'BASICO' }
  get esPlanPro(): boolean { return this.getPlan() === 'PRO' }
  get esPlanPremium(): boolean { return this.getPlan() === 'PREMIUM' }
  get permiteMercadoPago(): boolean {
    return this.esPlanPro || this.esPlanPremium
  }
}