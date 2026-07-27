export interface ProductoRequest {
    nombre: string;
    descripcion?: string;
    codigoBarras?: string;
    categoriaId?: number;
    imagenUrl?: string;
    precioVenta: number;
    costo: number;
    stockInicial: number;
}

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
