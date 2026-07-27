export interface RegistrarPagoRequest {
    metodo: 'EFECTIVO' | 'MERCADOPAGO';
    monto: number;
    codigoCupon?: string;
}

export interface PagoResponse {
    id: number;
    pedidoId: number;
    metodo: string;
    monto: number;
    fecha: string;
}
