import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  imports: [RouterModule, NgIf],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  permissions: string[] = [];
  
  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.permissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}
