import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    {
        path: 'auth',
        loadChildren: () =>
            import('./features/auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadChildren: () =>
            import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'my-orders',
        canActivate: [authGuard],
        loadChildren: () =>
            import('./features/my-orders/my-orders.module').then(m => m.MyOrdersModule)
    },
    {
        path: 'order-report',
        canActivate: [authGuard],
        loadChildren: () =>
            import('./features/order-report/order-report.module').then(m => m.OrderReportModule)
    },
    {
        path: 'delivery',
        canActivate: [authGuard],
        loadChildren: () =>
            import('./features/delivery/delivery.module').then(m => m.DeliveryModule)
    },
    {
        path: 'my-orders/grouped-orders',
        canActivate: [authGuard],
        loadChildren: () =>
            import('./features/grouped-orders/grouped-orders.module').then(m => m.GroupedOrdersModule)
    },
    { path: '**', redirectTo: 'auth/login' }
];
