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