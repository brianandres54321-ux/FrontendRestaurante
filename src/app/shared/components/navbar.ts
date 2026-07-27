import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {

  empresaNombre: string = '';
  nombreUsuario: string = '';
  collapsed: boolean = false;
  rol: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.empresaNombre = this.authService.getEmpresaNombre();
    this.rol = this.authService.getRol()?.toUpperCase() ?? '';
    this.nombreUsuario = this.authService.getUsername();
  }

  get esAdmin(): boolean { return this.rol === 'ADMIN'; }
  get esCajero(): boolean { return this.rol === 'CAJERO'; }
  get esMesero(): boolean { return this.rol === 'MESERO'; }
  get esAdminOCajero(): boolean { return this.esAdmin || this.esCajero; }

  get esRestaurante(): boolean { return this.authService.esRestaurante; }
  get esTienda(): boolean { return this.authService.esTienda; }

  toggleSidebar(): void { this.collapsed = !this.collapsed; }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}