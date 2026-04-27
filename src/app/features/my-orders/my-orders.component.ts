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

  pageNo = 0;
  pageSize = 30000;
  totalPages = 0;
  totalElements = 0;

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
  Math = Math;

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
      assignedDriverId: this.selectedDriver || undefined,
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      sortBy: 'deliveryDate',
      sortDirection: 'asc'
    }).subscribe({
      next: (res) => {
        this.orders = res?.response?.dataSet || [];
        this.totalPages = res?.response?.totalPages || 0;
        this.totalElements = res?.response?.totalElements || 0;
        this.orders.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

        // Update drivers only on date change or initial load
        if (!this.selectedDriver) {
        this.drivers = [
          ...new Map(
            this.orders
              .filter(o => o.driverId && o.driverName)
              .map(o => [o.driverId, { driverId: o.driverId, driverName: o.driverName }])
          ).values()
        ];
      }
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

setDriverJetro(order: any) {
    order.driverJetro = !order.driverJetro;
    this.orderService.setDriverJetro(order?.orderId).subscribe({
    next: (res)=>{
      console.log(res)
    },
    error: (err)=>{
      console.log('error setting warehouse', err)
    }
  })
}
setDriverWarehouse(order: any) {
  order.driverWarehouse = !order.driverWarehouse 
  this.orderService.setDriverWarehouse(order?.orderId).subscribe({
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
      this.loadOrders();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  get displayPageNo(): number {
    return this.pageNo + 1;
  }
}
