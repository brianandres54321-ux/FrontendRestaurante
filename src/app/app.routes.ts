import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard, adminCajeroGuard, cocinaGuard, restauranteGuard, tiendaGuard } from './core/guards/role-guard';
import { Login } from './public/auth/login';
import { Register } from './public/auth/register';
import { Landing } from './public/landing/landing';
import { MainLayout } from './layouts/main-layout';
import { ListaProductos } from './features/productos/lista-productos';
import { ListaCategorias } from './features/categorias/lista-categorias';
import { Ayuda } from './features/ayuda/ayuda';
import { ListaUsuarios } from './features/usuarios/lista-usuarios';
import { ListaMesas } from './features/mesas/lista-mesas';
import { ListaPedidos } from './features/pedidos/lista-pedidos';
import { VentaDirecta } from './features/pedidos/venta-directa';
import { DetalleMesaComponent } from './features/mesas/components/detalle';
import { ListaSecciones } from './features/secciones/lista-secciones';
import { MiEmpresa } from './features/empresa/mi-empresa';
import { ReportesComponent } from './features/reportes/reportes';
import { CierreCajaComponent } from './features/cierre-caja/cierre-caja';
import { CuponesComponent } from './features/cupon/lista-cupones';
import { CocinaComponent } from './features/cocina/cocina'



export const routes: Routes = [
    // ── Público (src/app/public) — sin autenticación ────────────────
    { path: '', component: Landing, pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'registro', component: Register },

    // ── Interno (src/app/features) — requiere sesión ────────────────
    { path: 'cocina', component: CocinaComponent, canActivate: [cocinaGuard] },
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            // Todos los roles — solo negocios tipo RESTAURANTE
            { path: 'mesas', component: ListaMesas, canActivate: [restauranteGuard] },
            { path: 'mesas/detalle/:id', component: DetalleMesaComponent, canActivate: [restauranteGuard] },

            // Todos los roles — solo negocios tipo TIENDA
            { path: 'venta-directa', component: VentaDirecta, canActivate: [tiendaGuard] },

            // Admin + Cajero
            {
                path: 'pedidos', component: ListaPedidos,
                canActivate: [adminCajeroGuard]
            },

            // Solo Admin
            {
                path: 'productos', component: ListaProductos,
                canActivate: [adminGuard]
            },
            {
                path: 'categorias', component: ListaCategorias,
                canActivate: [adminGuard]
            },
            {
                path: 'secciones', component: ListaSecciones,
                canActivate: [adminGuard, restauranteGuard]
            },
            {
                path: 'empresa', component: MiEmpresa,
                canActivate: [adminGuard]
            },
            {
                path: 'usuarios', component: ListaUsuarios,
                canActivate: [adminGuard]
            },
            {
                path: 'reportes', component: ReportesComponent,
                canActivate: [adminGuard]
            },
            {
                path: 'cierre-caja', component: CierreCajaComponent,
                canActivate: [adminGuard]
            },
            {
                path: 'cupones', component: CuponesComponent,
                canActivate: [adminGuard]
            },

            // Todos los roles
            { path: 'ayuda', component: Ayuda }
        ]
    },
    { path: '**', redirectTo: '' }
];