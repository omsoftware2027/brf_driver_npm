import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, FormsModule, NgIf, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'driver-brfood';
  pageTitle = 'Dashboard'; // default page
  hideLayout = true;
  showBack = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        while (child?.firstChild) {
          child = child.firstChild;
        }
        return child?.snapshot.data || {};
      })
    ).subscribe(data => {
      this.pageTitle = data['title'] || '';
      this.showBack = data['showBack'] || false;
      this.hideLayout = this.router.url.includes('/auth/');
    });
  }
}
