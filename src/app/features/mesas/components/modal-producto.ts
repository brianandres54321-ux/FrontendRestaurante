import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoResponse } from '../../../shared/models';

@Component({
  selector: 'app-modal-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-producto.html',
  styleUrl: './modal-producto.scss'
})
export class ModalProductoComponent {
  private _productos: ProductoResponse[] = [];

  // Diccionario para rastrear cantidades temporales: { productoId: cantidad }
  seleccionados: { [key: number]: number } = {};

  @Input()
  set productos(value: ProductoResponse[]) {
    // Cuando el padre actualiza la lista (ej. después de un guardar exitoso),
    // recibimos los nuevos valores de stock de la DB.
    this._productos = value ?? [];
    this.generarCategorias();
    this.filtrar();
  }

  get productos(): ProductoResponse[] {
    return this._productos;
  }

  @Output() alSeleccionar = new EventEmitter<{ producto: ProductoResponse, cantidad: number }>();
  @Output() alCerrar = new EventEmitter<void>();

  busqueda: string = '';
  productosFiltrados: ProductoResponse[] = [];
  categorias: string[] = [];
  categoriaSeleccionada: string = 'TODOS';

  generarCategorias(): void {
    const todas = this._productos.map(p => p.categoriaNombre || 'Sin Categoría');
    this.categorias = ['TODOS', ...new Set(todas)];
  }

  filtrar(): void {
    const term = this.busqueda.toLowerCase().trim();
    this.productosFiltrados = this._productos.filter(p => {
      const coincideBusqueda = !term || p.nombre.toLowerCase().includes(term);
      const coincideCategoria = this.categoriaSeleccionada === 'TODOS' ||
        (p.categoriaNombre || 'Sin Categoría') === this.categoriaSeleccionada;
      return p.activo && coincideBusqueda && coincideCategoria;
    });
  }

  seleccionarCategoria(cat: string): void {
    this.categoriaSeleccionada = cat;
    this.filtrar();
  }

  // --- LÓGICA DE STOCK ---

  sumar(producto: ProductoResponse): void {
    const cantTemporal = this.seleccionados[producto.id] || 0;
    // Solo permite sumar si la cantidad temporal es menor al stock actual del objeto
    if (cantTemporal < (producto.stock || 0)) {
      this.seleccionados[producto.id] = cantTemporal + 1;
    }
  }

  restar(producto: ProductoResponse): void {
    const cantTemporal = this.seleccionados[producto.id] || 0;
    if (cantTemporal > 0) {
      this.seleccionados[producto.id] = cantTemporal - 1;
    }
  }

  /**
   * Calcula el stock que se muestra en el badge.
   * Stock actual del objeto - lo que el usuario tiene marcado en el contador (+/-)
   */
  getStockVisual(producto: ProductoResponse): number {
    const temporal = this.seleccionados[producto.id] || 0;
    return (producto.stock || 0) - temporal;
  }

  confirmar(producto: ProductoResponse): void {
    const cantidadAEnviar = this.seleccionados[producto.id] || 0;

    if (cantidadAEnviar > 0) {
      // Emitimos la selección
      this.alSeleccionar.emit({ producto, cantidad: cantidadAEnviar });

      // Limpiamos el contador temporal inmediatamente
      this.seleccionados[producto.id] = 0;

      // Forzamos el filtrado para que la UI se refresque sin esperar al Input
      this.filtrar();
    }
  }
  trackByProducto(index: number, p: ProductoResponse): number {
    return p.id;
  }
}