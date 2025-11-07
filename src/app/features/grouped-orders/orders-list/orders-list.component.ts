import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
  standalone: false
})
export class OrdersListComponent {

  Math = Math;
  pageNo = 0;
  pageSize = 30;
  totalPages = 0;
  totalElements = 0;

  orders: any[] = [];
  todayDate: string = '';
  user: any;
  searchText: string = '';

  modalRef?: BsModalRef;
  drivers: any[] = [];
  selectedDriver: number | null = null;

  selectedDate: string = '';


  constructor(
    public orderService: OrderService,
    public authService: AuthService,
    private toastr: ToastrService,
    public router: Router,
    public location: Location,
    public modalService: BsModalService
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(
      user => {
        this.user = user;
        const today = new Date();
        this.todayDate = today.toISOString().split('T')[0]
        this.selectedDate = this.todayDate;
        this.getAllOrders();
      }
    );
  }

  goBack() {
    this.location.back()
  }

  goToGroupedOrderDetail(order: any) {
    this.router.navigate(
      ['/my-orders/grouped-orders/grouped-order-detail', order.idorders],
      {
        queryParams: {
          userId: order.userId,
          shippingDate: order.shippingDate,
          shippingAddress: order.shippingAddress
        }
      }
    );
  }

  getAllOrders() {
    this.orderService.getCombinedOrders(this.selectedDate, this.selectedDriver, this.searchText, this.pageNo, this.pageSize).subscribe({
      next: (res) => {
        this.orders = res?.response?.dataSet || [];
        this.totalPages = res?.response?.totalPages || 0;
        this.totalElements = res?.response?.totalElements || 0;
        // collect drivers
        this.drivers = [
          ...new Map(
            this.orders
              .filter(order => order.driverId && order.driverName)
              .map(order => [order.driverId, { driverId: order.driverId, driverName: order.driverName }])
          ).values()
        ];
        console.log('Unique Valid Drivers:', this.drivers);
      },
      error: (err) => {
        this.toastr.error('Failed to fetch orders. Please try again later.', 'Error');
      }
    })
  }

onSearch() {
  this.getAllOrders();
}

  onDateChange(event: Event) {
    const selectedDate = (event.target as HTMLInputElement).value;
    this.selectedDate = selectedDate || '';
    this.getAllOrders();
  }
  clearDateFilter() {
    this.selectedDate = '';
    this.getAllOrders();
  }

  openDriverModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
  }
  applyDriverFilter() {
    console.log('Selected driver:', this.selectedDriver);
    this.modalRef?.hide();
    this.getAllOrders();
  }
  clearDriverFilter() {
    this.selectedDriver = null;
    this.getAllOrders();
  }

  get selectedDriverName(): string | null {
    const order = this.orders.find(o => o.driverId === this.selectedDriver);
    return order ? order.driverName : null;
  }

setDriverJetro(order: any) {
  order.driverJetro = !order.driverJetro;
    this.orderService.setDriverJetro(order.idorders).subscribe({
    next: (res)=>{
      console.log(res)
    },
    error: (err)=>{
      console.log('error setting warehouse', err)
    }
  })
}
setDriverWarehouse(order: any) {
  order.driverWarehouse = !order?.driverWarehouse;
  this.orderService.setDriverWarehouse(order?.idorders).subscribe({
    next: (res)=>{
      console.log(res)
    },
    error: (err)=>{
      console.log('error setting warehouse', err)
    }
  })
}

onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.pageNo = newPage;
      this.getAllOrders();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  get displayPageNo(): number {
    return this.pageNo + 1;
  }

}
