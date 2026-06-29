import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';
import { PermissionService } from '../services/permission.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);

  return authService.user$.pipe(
    map(user => {
      if (!user) {
        return router.parseUrl('/auth/login');
      }

      const permission = route.data?.['permission'];

      // Route doesn't require permission
      if (!permission) {
        return true;
      }

      // User has access
      if (permissionService.canView(permission)) {
        return true;
      }

      // Redirect to first available page
      const redirects = [
        {
          permission: 'DriverApp-Dashboard',
          route: '/dashboard'
        },
        {
          permission: 'DriverAppAllOrder',
          route: '/my-orders'
        },
        {
          permission: 'DriverAppOrderReport',
          route: '/order-report'
        },
        {
          permission: 'DriverAppCheckItem',
          route: '/delivery'
        }
      ];

      const firstAllowed = redirects.find(x =>
        permissionService.canView(x.permission)
      );

      if (firstAllowed) {
        return router.parseUrl(firstAllowed.route);
      }

      return router.parseUrl('/auth/login');
    })
  );
};
