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