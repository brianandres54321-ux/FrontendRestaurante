import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface ItemAyuda {
  icono: string;
  titulo: string;
  descripcion: string;
  soloRestaurante?: boolean;
  soloTienda?: boolean;
}

interface GrupoAyuda {
  titulo: string;
  items: ItemAyuda[];
}

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ayuda.html',
  styleUrl: './ayuda.scss'
})
export class Ayuda {

  abierto: string | null = null;

  grupos: GrupoAyuda[] = [
    {
      titulo: 'Vender',
      items: [
        {
          icono: 'bi-grid-3x3-gap',
          titulo: 'Mesas',
          descripcion: 'Ves el estado de cada mesa de un vistazo: libre, ocupada o esperando la cuenta. Tocas una mesa libre para abrir un pedido nuevo.',
          soloRestaurante: true
        },
        {
          icono: 'bi-fire',
          titulo: 'Cocina',
          descripcion: 'Pantalla en tiempo real para la cocina: muestra los pedidos abiertos con sus productos para que nada se demore ni se pierda.',
          soloRestaurante: true
        },
        {
          icono: 'bi-bag',
          titulo: 'Venta directa',
          descripcion: 'Para vender sin mesa: buscas el producto, lo agregas al carrito y cobras. Pensado para mostrador o vitrina.',
          soloTienda: true
        },
        {
          icono: 'bi-receipt',
          titulo: 'Pedidos',
          descripcion: 'Historial de todos los pedidos de tu negocio — abiertos, pagados y cancelados — con el detalle de cada uno.'
        },
        {
          icono: 'bi-ticket-perforated',
          titulo: 'Cupones',
          descripcion: 'Códigos de descuento que puedes crear y aplicar a un pedido antes de cobrarlo, por porcentaje o monto fijo.'
        }
      ]
    },
    {
      titulo: 'Catálogo',
      items: [
        {
          icono: 'bi-box-seam',
          titulo: 'Productos',
          descripcion: 'Tu catálogo completo: nombre, precio de venta, costo y stock disponible de cada producto que vendes.'
        },
        {
          icono: 'bi-tags',
          titulo: 'Categorías',
          descripcion: 'Agrupa tus productos (ej. Bebidas, Postres, Snacks) para encontrarlos más rápido al vender y al filtrar reportes. Se crean antes de asignarlas a un producto.'
        },
        {
          icono: 'bi-diagram-3',
          titulo: 'Secciones',
          descripcion: 'Divide tu local en zonas (ej. Terraza, Salón principal) y asigna cada mesa a una sección.',
          soloRestaurante: true
        }
      ]
    },
    {
      titulo: 'Administración',
      items: [
        {
          icono: 'bi-cash-stack',
          titulo: 'Cierre de Caja',
          descripcion: 'Resumen del dinero que entró en el turno, separado por método de pago (efectivo, Mercado Pago), para cuadrar la caja al final del día.'
        },
        {
          icono: 'bi-bar-chart-line',
          titulo: 'Reportes',
          descripcion: 'Exporta en PDF o Excel cuánto vendiste, cuándo y por qué método de pago, en el rango de fechas que elijas.'
        },
        {
          icono: 'bi-people',
          titulo: 'Usuarios',
          descripcion: 'Crea cuentas para tu equipo. Cada usuario tiene un rol (Admin, Cajero o Mesero) que define qué puede ver y hacer.'
        },
        {
          icono: 'bi-building',
          titulo: 'Mi Empresa',
          descripcion: 'Los datos de tu negocio (nombre, NIT/RUT) y el plan de suscripción activo, con sus límites y beneficios.'
        }
      ]
    }
  ];

  preguntas = [
    {
      pregunta: '¿Cuál es la diferencia entre Precio de Venta y Costo?',
      respuesta: 'El "Precio de Venta" es lo que le cobras al cliente. El "Costo" es lo que a ti te cuesta ese producto — es opcional, solo lo usa el sistema para que en el futuro puedas ver tu ganancia por producto.'
    },
    {
      pregunta: '¿Qué es el "Stock"?',
      respuesta: 'Es cuántas unidades de ese producto tienes disponibles para vender ahora mismo. Baja automáticamente cada vez que se vende una unidad, así que no tienes que actualizarlo a mano.'
    },
    {
      pregunta: 'No me deja seleccionar una categoría al crear un producto',
      respuesta: 'Las categorías no vienen creadas por defecto — tienes que crear al menos una desde el menú "Categorías" antes de poder asignarla a un producto.'
    },
    {
      pregunta: '¿Por qué no veo Mesas ni Cocina en el menú?',
      respuesta: 'Tu cuenta está configurada como Tienda, así que esas opciones están ocultas y en su lugar tienes "Venta directa". Si tu negocio sí maneja mesas, dinos y te ayudamos a cambiarlo.'
    }
  ];

  constructor(public authService: AuthService) { }

  itemsVisibles(grupo: GrupoAyuda): ItemAyuda[] {
    return grupo.items.filter(i => {
      if (i.soloRestaurante && !this.authService.esRestaurante) return false;
      if (i.soloTienda && !this.authService.esTienda) return false;
      return true;
    });
  }

  toggle(id: string): void {
    this.abierto = this.abierto === id ? null : id;
  }
}
