import { Component, HostListener, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule, Location } from '@angular/common';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() title: string = 'Page title';
  @Input() showBack: boolean = false;
  menuOpen = false;

  constructor(public authService: AuthService, private router: Router, public location: Location, public permissionService: PermissionService) { }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.permissionService.clearPermissions();
    this.authService.clearUser();
    this.menuOpen = false;
    this.router.navigateByUrl('/auth/login', {
      replaceUrl: true
    });
}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.header-profile')) {
      this.menuOpen = false;
    }
  }

  goBack() {
    // this.router.navigate(['/my-orders'])
    this.location.back();
  }
}
