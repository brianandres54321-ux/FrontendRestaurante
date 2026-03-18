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