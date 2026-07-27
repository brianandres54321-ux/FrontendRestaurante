import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { ProductoService } from './services/producto'
import { CategoriaService } from '../categorias/services/categoria'
import { AuthService } from '../../core/services/auth.service'
import { ProductoResponse } from '../../shared/models/producto.model'
import { CategoriaResponse } from '../../shared/models/categoria.model'
import { CrearProducto } from './crear-producto'

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, CrearProducto],
  templateUrl: './lista-productos.html',
  styleUrl: './lista-productos.scss'
})
export class ListaProductos implements OnInit {

  empresaId!: number
  productos: ProductoResponse[] = []
  productosFiltrados: ProductoResponse[] = []
  categorias: CategoriaResponse[] = []
  categoriaSeleccionada: number | null = null
  busqueda: string = ''

  // NUEVO: Control para saber si estamos viendo la papelera
  viendoInactivos: boolean = false

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    const empresaId = this.authService.getEmpresaId()
    if (!empresaId) {
      console.warn('No se encontró empresaId')
      return
    }
    this.empresaId = empresaId
    this.cargarDatosIniciales()
  }

  cargarDatosIniciales(): void {
    this.categoriaService.listar(this.empresaId).subscribe({
      next: (categorias) => {
        this.categorias = categorias ?? []
        this.cargarProductos()
      },
      error: (err) => console.error('Error cargando categorías', err)
    })
  }

  // MODIFICADO: Ahora decide si carga activos o inactivos
  cargarProductos(): void {
    const observable = this.viendoInactivos
      ? this.productoService.listarInactivos(this.empresaId)
      : this.productoService.listar(this.empresaId);

    observable.subscribe({
      next: (productos) => {
        const base = productos ?? []
        this.productos = base.sort((a, b) => a.nombre.localeCompare(b.nombre))
        this.filtrarProductos()
        this.cdr.detectChanges() // Fuerza la actualización de la vista
      },
      error: (err) => console.error('Error al cargar productos', err)
    })
  }

  // NUEVO: Método para alternar entre Vista Normal y Papelera
  toggleVerInactivos(): void {
    this.viendoInactivos = !this.viendoInactivos;
    this.categoriaSeleccionada = null; // Limpiamos filtros para ver todo
    this.cargarProductos();
  }

  // NUEVO: Método para restaurar productos
  activarProducto(producto: ProductoResponse): void {
    this.productoService.activar(this.empresaId, producto.id).subscribe({
      next: () => {
        console.log('Producto restaurado');
        this.cargarProductos(); // Se quita de la lista de inactivos y vuelve a la normal
      },
      error: (err) => console.error('Error activando producto', err)
    })
  }

  filtrarProductos(): void {
    let resultado = [...this.productos]
    if (this.categoriaSeleccionada !== null) {
      resultado = resultado.filter(p => p.categoriaId === this.categoriaSeleccionada)
    }
    if (this.busqueda.trim() !== '') {
      const texto = this.busqueda.toLowerCase()
      resultado = resultado.filter(p => p.nombre.toLowerCase().includes(texto))
    }
    this.productosFiltrados = resultado
  }

  cambiarCategoria(id: number | null): void {
    this.categoriaSeleccionada = id
    this.filtrarProductos()
  }

  buscar(): void {
    this.filtrarProductos()
  }

  crearProducto(): void {
    this.abrirModal()
  }

  editarProducto(producto: ProductoResponse): void {
    this.abrirModal(producto)
  }

  eliminarProducto(producto: ProductoResponse): void {
    if (!confirm('¿Enviar este producto a la papelera?')) return
    this.productoService.eliminar(this.empresaId, producto.id).subscribe({
      next: () => {
        // Al recargar aquí, el producto desaparece de la vista actual 
        // porque el backend ya lo marcó como activo=false
        this.cargarProductos();
      },
      error: (err) => console.error('Error eliminando producto', err)
    })
  }

  trackByProducto(index: number, producto: ProductoResponse): number {
    return producto.id
  }

  mostrarModal = false
  productoEditando: ProductoResponse | null = null

  abrirModal(producto?: ProductoResponse): void {
    this.productoEditando = producto ? producto : null;
    this.mostrarModal = true 
  }

  cerrarModal(): void {
    this.mostrarModal = false
    this.productoEditando = null
  }

  productoGuardado(): void {
    this.cerrarModal()
    this.cargarProductos() // Recarga inmediatamente después de guardar/crear
  }
}