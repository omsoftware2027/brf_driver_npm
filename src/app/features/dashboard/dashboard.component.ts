import { Component } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  user: any = null;
  private destroy$ = new Subject<void>();

  orderStatisticsCount: any = {};

  constructor(
    private authService: AuthService,
    private dashBoardService: DashboardService
  ) {}

  ngOnInit() {

    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        // Call API when user changes
        if (this.user?.id) {
          this.dashBoardService.getOrdersCounts(this.user.id).subscribe(res => {
            (res.status === 0) ? this.orderStatisticsCount = res?.response : this.orderStatisticsCount = {};
          });
        }
      });
  }


}
