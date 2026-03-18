import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturaService } from '../Services/factura';
import { AuthService } from '../../../core/services/auth.service';
import { PedidoResponse } from '../../../shared/models';

@Component({
  selector: 'app-lista-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-facturas.html',
  styleUrl: './lista-facturas.scss'
})
export class ListaFacturas implements OnInit {
  empresaId!: number;
  facturas: any[] = []; // Idealmente usa FacturaResponse
  totalVentas: number = 0;
  nombreSoftware: string = 'MiFactura Pro'; // Tu marca

  constructor(
    private facturaService: FacturaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    // Aquí llamarías a un método de tu servicio para listar facturas por empresa
    // Por ahora simulamos la carga para el diseño
    console.log('Cargando historial de facturación para empresa:', this.empresaId);
  }

  imprimirFactura(factura: any): void {
    window.print();
  }

  getBadgeClass(metodo: string): string {
    return metodo === 'EFECTIVO' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary';
  }
}