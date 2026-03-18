export interface ProductoResponse {
    id: number
    nombre: string
    descripcion?: string
    codigoBarras?: string
    activo: boolean
    precioActual: number
    categoriaId?: number
    categoriaNombre?: string
    stock: number
    imagen?: string
}