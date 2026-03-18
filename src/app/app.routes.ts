import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard, adminCajeroGuard, cocinaGuard } from './core/guards/role-guard';
import { Login } from './features/auth/pages/login/login';
import { MainLayout } from './layouts/main-layout/main-layout';
import { ListaProductos } from './features/productos/pages/lista-productos/lista-productos';
import { ListaUsuarios } from './features/usuarios/pages/lista-usuarios/lista-usuarios';
import { ListaMesas } from './features/mesas/pages/lista-mesas/lista-mesas';
import { ListaPedidos } from './features/pedidos/pages/lista-pedidos/lista-pedidos';
import { DetalleMesaComponent } from './features/mesas/components/detalle/detalle';
import { ListaSecciones } from './features/secciones/pages/lista-secciones/lista-secciones';
import { MiEmpresa } from './features/empresa/pages/mi-empresa';
import { ReportesComponent } from './features/reportes/pages/reportes';
import { CierreCajaComponent } from './features/cierre-caja/pages/CierreCajaComponent';
import { CuponesComponent } from './features/cupon/pages/CuponesComponent';
import { CocinaComponent } from './features/cocina/pages/CocinaComponent'



export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'cocina', component: CocinaComponent, canActivate: [cocinaGuard] },
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            // Todos los roles
            { path: 'mesas', component: ListaMesas },
            { path: 'mesas/detalle/:id', component: DetalleMesaComponent },

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
                path: 'secciones', component: ListaSecciones,
                canActivate: [adminGuard]
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
            }
        ]
    },
    { path: '**', redirectTo: 'login' }
];