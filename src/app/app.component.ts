import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, FormsModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'driver-brfood';
  pageTitle = 'Dashboard'; // default page
  hideLayout = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {

        this.hideLayout = event.url.includes('/auth/') || event.urlAfterRedirects.includes('/auth/');

        // Set page title based on route
        if (event.url.includes('dashboard')) {
          this.pageTitle = 'Dashboard';
        }
        else if (event.url.includes('orders')) {
          this.pageTitle = 'My Orders';
        }
        else if (event.url.includes('order-report')) {
          this.pageTitle = 'Order Report';
        }
        else {
          this.pageTitle = '';
        }
      }
    });
  }
}
