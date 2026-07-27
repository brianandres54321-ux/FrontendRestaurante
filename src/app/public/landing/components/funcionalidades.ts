import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Funcionalidad {
  icono: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-funcionalidades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './funcionalidades.html',
  styleUrl: './funcionalidades.scss'
})
export class Funcionalidades {

  funcionalidades: Funcionalidad[] = [
    {
      icono: 'bi-grid-3x3-gap',
      titulo: 'Mesas y pedidos',
      descripcion: 'Organiza tu salón por secciones, une o separa mesas y controla cada pedido en tiempo real.'
    },
    {
      icono: 'bi-fire',
      titulo: 'Cocina en vivo',
      descripcion: 'Pantalla de cocina que recibe los pedidos al instante para que nada se demore ni se pierda.'
    },
    {
      icono: 'bi-box-seam',
      titulo: 'Productos e inventario',
      descripcion: 'Catálogo por categorías, precios con historial y control de stock automático por venta.'
    },
    {
      icono: 'bi-credit-card',
      titulo: 'Pagos y Mercado Pago',
      descripcion: 'Cobra en efectivo o con Mercado Pago, y aplica cupones de descuento sin salir del pedido.'
    },
    {
      icono: 'bi-graph-up',
      titulo: 'Reportes de venta',
      descripcion: 'Reportes exportables en PDF y Excel para saber qué se vendió, cuándo y por cuánto.'
    },
    {
      icono: 'bi-cash-stack',
      titulo: 'Cierre de caja',
      descripcion: 'Cuadra la caja al final del turno con el total por método de pago, listo para revisar.'
    },
    {
      icono: 'bi-people',
      titulo: 'Usuarios y roles',
      descripcion: 'Cuentas separadas para administradores, cajeros y meseros, cada uno con lo que necesita ver.'
    },
    {
      icono: 'bi-building',
      titulo: 'Multi-empresa',
      descripcion: 'Cada negocio tiene su propia cuenta, sus propios datos y su propio equipo, aislado del resto.'
    }
  ];
}
