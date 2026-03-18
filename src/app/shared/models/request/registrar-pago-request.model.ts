export interface RegistrarPagoRequest {
    metodo: 'EFECTIVO' | 'MERCADOPAGO';
    monto: number;
    codigoCupon?: string;
}