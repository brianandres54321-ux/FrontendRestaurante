export interface AbrirPedidoRequest {
    mesaId: number;
    usuarioId: number;
}

export interface AbrirVentaDirectaRequest {
    usuarioId: number;
}

export interface CrearPedidoRequest {
    mesaId: number;
}

export interface AgregarProductoRequest {
    productoId: number;
    cantidad: number;
}

export interface ReducirCantidadRequest {
    cantidad: number;
}

export interface PedidoItemResponse {
    id: number;
    productoId: number;
    productoNombre: string;
    imagen: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    notas: string;
}

export interface PedidoResponse {
    id: number;
    empresaId: number;
    mesaId: number | null;
    mesa: string;
    grupoId?: number | null;
    usuarioId: number;
    total: number;
    totalPagado: number;
    estado: 'ABIERTO' | 'PAGADO' | 'CANCELADO';
    fechaApertura: string;
    fechaCierre?: string | null;
    metodoPago?: string | null;
    items: PedidoItemResponse[];
    estadoCocina?: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO';
}
