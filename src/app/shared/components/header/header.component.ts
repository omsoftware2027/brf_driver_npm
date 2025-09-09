import { Component, HostListener, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

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

  constructor(public authService: AuthService, private router: Router) { }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.authService.clearUser();
    this.menuOpen = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.header-profile')) {
      this.menuOpen = false;
    }
  }

  goBack() {
    this.router.navigate(['/my-orders'])
  }
}
