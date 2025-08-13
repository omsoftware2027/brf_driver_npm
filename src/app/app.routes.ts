import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    {
        path: 'auth',
        loadChildren: () =>
            import('./features/auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'dashboard',
        loadChildren: () =>
            import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'my-orders',
        loadChildren: () =>
            import('./features/my-orders/my-orders.module').then(m => m.MyOrdersModule)
    },
    {
        path: 'order-report',
        loadChildren: () =>
            import('./features/order-report/order-report.module').then(m => m.OrderReportModule)
    },
    { path: '**', redirectTo: 'auth/login' }
];
