export interface InventarioRequest {
    productoId: number;
    stockActual: number;
    stockMinimo: number;
}

export interface InventarioResponse {
    productoId: number;
    stockActual: number;
    stockMinimo: number;
}
