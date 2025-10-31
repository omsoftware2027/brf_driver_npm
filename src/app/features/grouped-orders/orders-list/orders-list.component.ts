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

  orders: any[] = [];
  todayDate: string = '';
  endDate: string = '';
  user: any;
  searchText: string = '';
  searchResults: any[] = [];

  modalRef?: BsModalRef;
  drivers: any[] = [];
  selectedDriver: number | null = null;
  ordersBackup: any[] = [];

  selectedDate: string = '';
  @ViewChild('dateFilterInput') dateFilterInput!: ElementRef<HTMLInputElement>;


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
    this.orderService.getCombinedOrders().subscribe({
      next: (res) => {
        this.orders = res?.response?.dataSet || [];
        // collect drivers
        this.drivers = [
          ...new Map(
            this.orders
              .filter(order => order.driverId && order.driverName)
              .map(order => [order.driverId, { driverId: order.driverId, driverName: order.driverName }])
          ).values()
        ];
        console.log('Unique Valid Drivers:', this.drivers);
        this.orders.sort((a, b) => new Date(a.shippingDate).getTime() - new Date(b.shippingDate).getTime());
        // Keep backup copy of original orders
        this.ordersBackup = [...this.orders];

      },
      error: (err) => {
        this.toastr.error('Failed to fetch orders. Please try again later.', 'Error');
      }
    })
  }


  onSearch() {
    if (!this.user?.id || !this.searchText) {
      this.searchResults = [];
      return;
    }
    this.orderService.getCombinedOrders(this.searchText).subscribe({
      next: (res) => {
        this.searchResults = res?.response?.dataSet || [];
      },
      error: (err) => {
        this.toastr.error('Search failed. Please try again.', 'Error');
        this.searchResults = [];
      }
    });
  }


  triggerDatePicker() {
    this.dateFilterInput.nativeElement.value = '';
    this.dateFilterInput.nativeElement.showPicker();
  }
  onDateChange(event: Event) {
    const selectedDate = (event.target as HTMLInputElement).value;
    this.selectedDate = selectedDate || '';
    this.applyCombinedFilters(true);
  }
  clearDateFilter() {
    this.selectedDate = '';
    this.dateFilterInput.nativeElement.value = '';
    this.applyCombinedFilters(true);
  }

  applyCombinedFilters(updateDrivers = false) {
    this.orders = this.ordersBackup.filter(order => {
      const shortShippingDate = order.shippingDate?.substring(0, 10);
      const matchesDate = this.selectedDate ? shortShippingDate === this.selectedDate : true;
      const matchesDriver = this.selectedDriver ? order.driverId === this.selectedDriver : true;
      return matchesDate && matchesDriver;
    });
    console.log('filtered orders', this.orders)
    // Update drivers list based on filtered orders ...only on datefilter 
    if (updateDrivers) {
      this.drivers = [
        ...new Map(
          this.orders
            .filter(order => order.driverId && order.driverName)
            .map(order => [order.driverId, { driverId: order.driverId, driverName: order.driverName }])
        ).values()
      ];
    }
  }

  openDriverModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
  }
  applyDriverFilter() {
    console.log('Selected driver:', this.selectedDriver);
    this.modalRef?.hide();
    this.applyCombinedFilters(false);
  }
  clearDriverFilter() {
    this.selectedDriver = null;
    this.applyCombinedFilters(false);
  }

  get selectedDriverName(): string | null {
    const order = this.ordersBackup.find(o => o.driverId === this.selectedDriver);
    return order ? order.driverName : null;
  }

}
