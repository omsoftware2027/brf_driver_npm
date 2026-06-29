import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

    private permissions: any = {};

  constructor() {
    this.loadPermissions();
  }

  setPermissions(rolePrivileges: any[]) {

    this.permissions = {};

    (rolePrivileges || [])
      .filter(x => x.moduleName.startsWith('DriverApp'))
      .forEach(permission => {
        this.permissions[permission.moduleName] = permission;
      });

    localStorage.setItem(
      'driver_permissions',
      JSON.stringify(this.permissions)
    );
  }

  loadPermissions() {
    const data = localStorage.getItem('driver_permissions');

    if (data) {
      this.permissions = JSON.parse(data);
    }
  }

  clearPermissions() {
    this.permissions = {};
    localStorage.removeItem('driver_permissions');
  }

  canView(moduleName: string): boolean {
    return !!this.permissions[moduleName]?.isView;
  }

  canAdd(moduleName: string): boolean {
    return !!this.permissions[moduleName]?.isAdd;
  }

  canEdit(moduleName: string): boolean {
    return !!this.permissions[moduleName]?.isEdit;
  }

  canDelete(moduleName: string): boolean {
    return !!this.permissions[moduleName]?.isDelete;
  }

  getPermission(moduleName: string) {
    return this.permissions[moduleName] || null;
  }

}
