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
    mesaId: number;
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