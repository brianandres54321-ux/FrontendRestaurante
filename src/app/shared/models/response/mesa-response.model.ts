// mesa-response.model.ts
export interface MesaResponse {
    id: number;
    nombre: string;
    estado: string;
    activa: boolean;
    seccionId: number;
    seccionNombre: string;
    grupoId?: number | null;
}