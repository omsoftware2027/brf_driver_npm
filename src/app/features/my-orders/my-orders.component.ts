import { CommonModule } from '@angular/common';
import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.scss'
})
export class MyOrdersComponent {

  orders: any[] = [];
  todayDate: string = '';
  endDate: string = '';
  user: any;
  searchText: string = '';
  searchResults: any[] = [];

  modalRef?: BsModalRef;
  selectedDriver: number | null = null;
  drivers: any[] = [];

  selectedDate: string = '';


  constructor(
    public orderService: OrderService,
    public authService: AuthService,
    private toastr: ToastrService,
    public router: Router,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(
      user => {
        this.user = user;
        const today = new Date();
        this.selectedDate = today.toISOString().split('T')[0] || '';
        this.loadOrders();
      }
    );
  }

  loadOrders() {
    if (!this.user?.id) return;
    let startDate = '';
    let endDate = ''; 

    startDate = this.selectedDate || '';

    if (startDate) {
      const nextDay = new Date(startDate); 
      nextDay.setDate(new Date(startDate).getDate() + 1);
      endDate = nextDay.toISOString().split('T')[0];
    } else {
      endDate = '';
    }

    this.orderService.getOrders({
      driverId: this.user.id,
      startDate,
      endDate,
      search: this.searchText,
      assignedDriverId: this.selectedDriver || undefined
    }).subscribe({
      next: (res) => {
        this.orders = res?.response?.dataSet || [];
        this.orders.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

        // Update drivers only on date change or initial load
        this.drivers = [
          ...new Map(
            this.orders
              .filter(o => o.driverId && o.driverName)
              .map(o => [o.driverId, { driverId: o.driverId, driverName: o.driverName }])
          ).values()
        ];
      },
      error: () => this.toastr.error('Failed to fetch orders. Please try again later.', 'Error')
    });
  }

  onSearch() {
    this.loadOrders();
  }

  openDriverModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
  }
  applyDriverFilter() {
    this.modalRef?.hide();
    this.loadOrders();
  }
  clearDriverFilter() {
    this.selectedDriver = null;
    this.loadOrders();
  }

  onDateChange(event: Event) {
    const selectedDate = (event.target as HTMLInputElement).value;
    this.selectedDate = selectedDate || '';
    this.loadOrders();
  }
  clearDateFilter() {
    this.selectedDate = '';
    this.loadOrders();
  }

  get selectedDriverName(): string | null {
    const order = this.orders.find(o => o.driverId === this.selectedDriver);
    return order ? order.driverName : null;
  }

setDriverJetro(orderId: any) {
    this.orderService.setDriverJetro(orderId).subscribe({
    next: (res)=>{
      console.log(res)
    },
    error: (err)=>{
      console.log('error setting warehouse', err)
    }
  })
}
setDriverWarehouse(orderId: any) {
  this.orderService.setDriverWarehouse(orderId).subscribe({
    next: (res)=>{
      console.log(res)
    },
    error: (err)=>{
      console.log('error setting warehouse', err)
    }
  })
}
}
