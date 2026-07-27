import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ItemTipo {
  icono: string;
  texto: string;
}

interface TipoNegocioInfo {
  icono: string;
  titulo: string;
  descripcion: string;
  items: ItemTipo[];
}

@Component({
  selector: 'app-tipos-negocio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tipos-negocio.html',
  styleUrl: './tipos-negocio.scss'
})
export class TiposNegocio {

  tipos: TipoNegocioInfo[] = [
    {
      icono: 'bi-shop',
      titulo: 'Restaurantes',
      descripcion: 'Todo lo que pasa en tu salón, en un solo lugar.',
      items: [
        { icono: 'bi-grid-3x3-gap', texto: 'Mapa de mesas en tiempo real: libre, ocupada o esperando la cuenta' },
        { icono: 'bi-diagram-3', texto: 'Organiza tu local por secciones: salón, terraza, barra' },
        { icono: 'bi-fire', texto: 'Pantalla de cocina que recibe cada pedido al instante' },
        { icono: 'bi-receipt', texto: 'Un pedido por mesa, con su cuenta y su historial' }
      ]
    },
    {
      icono: 'bi-bag',
      titulo: 'Tiendas',
      descripcion: 'Pensado para vender rápido, sin vueltas.',
      items: [
        { icono: 'bi-lightning-charge', texto: 'Venta directa: buscás el producto, lo agregás al carrito y cobrás' },
        { icono: 'bi-upc-scan', texto: 'Catálogo con precio, costo y stock siempre actualizado' },
        { icono: 'bi-arrow-repeat', texto: 'El stock baja solo con cada venta, sin planillas' },
        { icono: 'bi-credit-card', texto: 'Cobrá en efectivo o con Mercado Pago en segundos' }
      ]
    }
  ];

  comunes: string[] = [
    'Productos y categorías',
    'Cupones de descuento',
    'Reportes en PDF y Excel',
    'Cierre de caja',
    'Usuarios y roles',
    'Mercado Pago'
  ];
}
