export interface Cupon {
    id: number;
    codigo: string;
    descripcion: string;
    tipo: 'PORCENTAJE' | 'MONTO_FIJO';
    valor: number;
    usosMaximos: number | null;
    usosActuales: number;
    fechaInicio: string | null;
    fechaFin: string | null;
    montoMinimo: number | null;
    activo: boolean;
    creadoEn: string;
}

export interface CuponRequest {
    codigo: string;
    descripcion: string;
    tipo: string;
    valor: number;
    usosMaximos: number | null;
    fechaInicio: string | null;
    fechaFin: string | null;
    montoMinimo: number | null;
    activo: boolean;
}

export interface ValidarCuponResponse {
    valido: boolean;
    mensaje: string;
    codigo: string;
    tipo: string;
    valor: number;
    descuento: number;
    totalConDescuento: number;
}
