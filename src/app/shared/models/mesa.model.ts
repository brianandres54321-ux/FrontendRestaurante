export interface MesaRequest {
    nombre: string;
    seccionId: number;
}

export interface MesaResponse {
    id: number;
    nombre: string;
    estado: string;
    activa: boolean;
    seccionId: number;
    seccionNombre: string;
    grupoId?: number | null;
}
