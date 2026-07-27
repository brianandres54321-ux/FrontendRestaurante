export interface SeccionRequest {
    nombre: string;
}

export interface SeccionResponse {
    id: number;
    nombre: string;
    activa?: boolean;
}
