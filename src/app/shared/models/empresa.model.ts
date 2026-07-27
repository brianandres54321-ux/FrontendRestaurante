export type TipoNegocio = 'RESTAURANTE' | 'TIENDA';

export interface EmpresaResponse {
    id: number;
    nombre: string;
    nitRut: string;
    plan: 'BASICO' | 'PRO' | 'PREMIUM';
    tipoNegocio: TipoNegocio;
    activa: boolean;
}

export interface PlanInfo {
    id: 'BASICO' | 'PRO' | 'PREMIUM';
    nombre: string;
    precio: string;
    mesas: string;
    // Misma info que "mesas" pero con redacción neutral, para mostrar en
    // páginas públicas donde todavía no sabemos si el visitante tiene
    // restaurante o tienda (venta directa no tiene límite en ningún plan).
    capacidad: string;
    usuarios: string;
    mercadoPago: boolean;
    reportes: boolean;
    soporte: string;
    color: string;
    recomendado: boolean;
}

export const PLANES: PlanInfo[] = [
    {
        id: 'BASICO',
        nombre: 'Básico',
        precio: 'Gratis',
        mesas: 'Hasta 5 mesas',
        capacidad: 'Hasta 5 mesas o venta directa ilimitada',
        usuarios: '1 usuario',
        mercadoPago: false,
        reportes: false,
        soporte: 'Comunidad',
        color: '#64748b',
        recomendado: false
    },
    {
        id: 'PRO',
        nombre: 'Pro',
        precio: '$49.900 / mes',
        mesas: 'Hasta 20 mesas',
        capacidad: 'Hasta 20 mesas o venta directa ilimitada',
        usuarios: 'Hasta 5 usuarios',
        mercadoPago: true,
        reportes: true,
        soporte: 'Email',
        color: '#2563eb',
        recomendado: true
    },
    {
        id: 'PREMIUM',
        nombre: 'Premium',
        precio: '$99.900 / mes',
        mesas: 'Ilimitadas',
        capacidad: 'Mesas y venta directa ilimitadas',
        usuarios: 'Ilimitados',
        mercadoPago: true,
        reportes: true,
        soporte: 'Prioritario 24/7',
        color: '#7c3aed',
        recomendado: false
    }
];
