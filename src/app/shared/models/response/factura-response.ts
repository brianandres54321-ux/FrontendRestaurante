import { PedidoResponse } from './pedido-response.model';

export interface FacturaResponse {
    id: number;
    numeroFactura: string; // Ej: FE-2026-0001
    pedidoId: number;
    pedido: PedidoResponse; // Incluye los items, mesa e IDs
    fechaEmision: string;
    subtotal: number;
    propina: number;
    total: number;
    metodoPago: string;
    marcaAguaSoftware: string; // "PowerBy: TuMarca"
}