import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductoService } from '../../services/producto';
import { AuthService } from '../../../../core/services/auth.service';

import { ProductoRequest } from '../../../../shared/models/request/producto-request.model';
import { CategoriaResponse } from '../../../../shared/models/response/categoria-response.model';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-producto.html',
  styleUrl: './crear-producto.scss'
})
export class CrearProducto implements OnInit {

  @Input() visible: boolean = false;
  @Input() categorias: CategoriaResponse[] = [];

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  // Variables de estado
  empresaId!: number;
  esEdicion: boolean = false;
  idProductoEdicion: number | null = null;
  imagenFile: File | null = null;

  // Objeto principal para el request
  producto: ProductoRequest = this.inicializarProducto();

  @Input() set productoParaEditar(val: any) {
    if (val) {
      this.esEdicion = true;
      this.idProductoEdicion = val.id;

      this.producto = {
        nombre: val.nombre,
        descripcion: val.descripcion || '',
        codigoBarras: val.codigoBarras || '',
        categoriaId: val.categoriaId,
        imagenUrl: val.imagen || '',
        precioVenta: val.precioActual || 0,
        costo: val.costo || 0,
        stockInicial: val.stock || 0
      };
    } else {
      this.esEdicion = false;
      this.idProductoEdicion = null;
      this.producto = this.inicializarProducto();
    }
  }

  constructor(
    private productoService: ProductoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const empresa = this.authService.getEmpresaId();
    if (empresa) {
      this.empresaId = empresa;
    }
  }

  private inicializarProducto(): ProductoRequest {
    return {
      nombre: '',
      descripcion: '',
      codigoBarras: '',
      categoriaId: undefined,
      imagenUrl: '',
      precioVenta: 0,
      costo: 0,
      stockInicial: 0
    };
  }

  // En onImagenSeleccionada, crea una previsualización (opcional pero ayuda mucho)
  onImagenSeleccionada(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagenFile = file;
      const reader = new FileReader();

      reader.onload = (e: any) => {
        // Seteamos el Base64 directamente al objeto producto para previsualizar
        this.producto.imagenUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  guardar(): void {
    if (!this.producto.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    // Aseguramos valores numéricos para evitar errores de integridad
    this.producto.costo = this.producto.costo || 0;
    this.producto.precioVenta = this.producto.precioVenta || 0;
    this.producto.stockInicial = this.producto.stockInicial || 0;

    if (this.esEdicion && this.idProductoEdicion) {
      this.productoService.actualizar(this.empresaId, this.idProductoEdicion, this.producto)
        .subscribe({
          next: () => {
            console.log('¡Producto actualizado con Base64!');
            this.notificarExito();
          },
          error: (err) => this.manejarError(err, 'actualizar')
        });
    } else {
      this.productoService.crear(this.empresaId, this.producto)
        .subscribe({
          next: () => this.notificarExito(),
          error: (err) => this.manejarError(err, 'crear')
        });
    }
  }

  private notificarExito(): void {
    this.guardado.emit();
    this.cerrarModal();
  }

  private manejarError(err: any, accion: string): void {
    console.error(`Error al ${accion} producto:`, err);
    alert(`Ocurrió un error al ${accion} el producto. Revisa la consola.`);
  }
}