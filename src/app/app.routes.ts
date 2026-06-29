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
        data: {
            permission: 'DriverApp-Dashboard'
        },
        loadChildren: () =>
            import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'my-orders',
        canActivate: [authGuard],
        data: {
            permission: 'DriverAppAllOrder'
        },
        loadChildren: () =>
            import('./features/my-orders/my-orders.module').then(m => m.MyOrdersModule)
    },
    {
        path: 'order-report',
        canActivate: [authGuard],
        data: {
            permission: 'DriverAppOrderReport'
        },
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
        data: {
            permission: 'DriverAppAllOrder'
        },
        loadChildren: () =>
            import('./features/grouped-orders/grouped-orders.module').then(m => m.GroupedOrdersModule)
    },
    { path: '**', redirectTo: 'auth/login' }
];
