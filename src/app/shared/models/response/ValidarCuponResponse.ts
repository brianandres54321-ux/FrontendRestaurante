export interface ValidarCuponResponse {
    valido: boolean;
    mensaje: string;
    codigo: string;
    tipo: string;
    valor: number;
    descuento: number;
    totalConDescuento: number;
}