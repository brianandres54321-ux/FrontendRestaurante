export interface PrecioResponse {
    id: number;
    productoId: number;
    precioVenta: number;
    costo: number;
    activo: boolean;
    fechaInicio: string;
}