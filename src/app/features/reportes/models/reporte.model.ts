
export interface ReporteVentas {
    totalVentas: number;
    cantidadPedidos: number;
    ticketPromedio: number;
    totalEfectivo: number;
    totalMercadoPago: number;
    topProductos: ProductoVendido[];
    pagos: FilaPago[];
    fechaDesde: string;
    fechaHasta: string;
    empresaNombre: string;
}

export interface ProductoVendido {
    nombre: string;
    cantidadVendida: number;
    ingresoGenerado: number;
}

export interface FilaPago {
    pagoId: number;
    pedidoId: number;
    mesa: string;
    metodo: string;
    monto: number;
    fecha: string;
}