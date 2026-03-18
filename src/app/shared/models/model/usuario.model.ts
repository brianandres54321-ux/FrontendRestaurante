export interface Usuario {
    id?: number;
    nombre: string;
    username: string;
    email: string;
    password?: string;
    rol: 'ADMIN' | 'MESERO' | 'CAJERO';
    activo?: boolean;
    creadoEn?: string;
}