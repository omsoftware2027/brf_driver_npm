import { Component } from '@angular/core';
import { OrderReportService } from '../../core/services/order-report.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-report',
  imports: [CommonModule],
  templateUrl: './order-report.component.html',
  styleUrl: './order-report.component.scss'
})
export class OrderReportComponent {
  selectedOrderReportType: string = 'Pickup';
  lastSevenDayDate: string = '';
  user: any;
  reports: any = {};

  constructor(
    public orderReportService: OrderReportService,
    public authService: AuthService,
  ) {
    const today = new Date();
    this.lastSevenDayDate = today.toISOString().split('T')[0];
  };

  ngOnInit() {
    this.authService.user$.subscribe(
      user => {
        this.user = user;
        this.getPickupReport(this.lastSevenDayDate, this.user?.id);
      })
  }

  setOrderReportType(type: string) {
    const driverId = this.user?.id;
    this.selectedOrderReportType = type;
    if (this.selectedOrderReportType === 'Pickup') {
      this.getPickupReport(this.lastSevenDayDate, driverId);
    }
    if (this.selectedOrderReportType === 'Jetro One') {
      this.getJetroOneReport(this.lastSevenDayDate, driverId);
    }
    if (this.selectedOrderReportType === 'Jetro Two') {
      this.getJetroTwoReport(this.lastSevenDayDate, driverId);
    }
    if (this.selectedOrderReportType === 'Warehouse') {
      this.getWarehouseReport(this.lastSevenDayDate, driverId);
    }
    if (this.selectedOrderReportType === 'Freezer One') {
      this.getFreezerOneReport(this.lastSevenDayDate, driverId);
    }
    if (this.selectedOrderReportType === 'Freezer Two') {
      this.getFreezerTwoReport(this.lastSevenDayDate, driverId);
    }
  }

  getPickupReport(date: any, driverId: any) {
    this.orderReportService.getPickupReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
      }
    })
  }
  getJetroOneReport(date: any, driverId: any) {
    this.orderReportService.getJetroOneReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
      }
    })
  }
  getJetroTwoReport(date: any, driverId: any) {
    this.orderReportService.getJetroTwoReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
      }
    })
  }
  getWarehouseReport(date: any, driverId: any) {
    this.orderReportService.getWarehouseReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
      }
    })
  }
  getFreezerOneReport(date: any, driverId: any) {
    this.orderReportService.getFreezerOneReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
      }
    })
  }
  getFreezerTwoReport(date: any, driverId: any) {
    this.orderReportService.getFreezerTwoReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
      }
    })
  }

}
