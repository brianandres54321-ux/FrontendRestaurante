export interface CierreCaja {
    id: number | null;
    fecha: string;
    cerradoEn: string | null;
    usuarioNombre: string;
    totalVentas: number;
    totalEfectivo: number;
    totalMercadoPago: number;
    cantidadPedidos: number;
    ticketPromedio: number;
    notas: string;
    yaExiste: boolean;
    pagos: FilaPago[];
}

export interface FilaPago {
    pedidoId: number;
    mesa: string;
    metodo: string;
    monto: number;
    hora: string;
}