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
    this.getAllDrivers();
    this.authService.user$.subscribe(
      user => {
        this.user = user;
        this.getAllOrders();
      }
    );
  }

  getAllDrivers() {
    this.orderService.getAllDrivers().subscribe({
      next: (res) => {
        this.drivers = res.response || [];
      }
    })
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
    this.dateFilterInput.nativeElement.showPicker();
  }
  onDateChange(event: Event) {
    const selectedDate = (event.target as HTMLInputElement).value;
    this.selectedDate = selectedDate || '';
    if (selectedDate) {
      this.orders = this.ordersBackup.filter(order => {
        const shortShippingDate = order.shippingDate?.substring(0, 10);;
        return shortShippingDate === this.selectedDate;
      });
    } else {
      this.orders = [...this.ordersBackup];
    }


    // const startDate = new Date(this.selectedDate);
    // const nextDay = new Date(startDate);
    // nextDay.setDate(startDate.getDate() + 1);

    // const formattedStartDate = startDate.toISOString().split('T')[0];
    // const formattedEndDate = nextDay.toISOString().split('T')[0];

    // this.orderService.getCombinedOrders(undefined, undefined).subscribe({
    //   next: (res) => {
    //     this.orders = res?.response?.dataSet || [];
    //     this.orders.sort((a, b) => new Date(a.shippingDate).getTime() - new Date(b.shippingDate).getTime());
    //   },
    //   error: (err) => {
    //     this.toastr.error('Failed to fetch orders. Please try again later.', 'Error');
    //   }
    // })

  }
  clearDateFilter() {
    this.selectedDate = '';
    this.orders = [...this.ordersBackup];
    // this.getAllOrders();
  }


  openDriverModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
  }

  applyDriverFilter() {
    console.log('Selected driver:', this.selectedDriver);
    this.modalRef?.hide();
    if (this.selectedDriver) {
      this.orders = this.ordersBackup.filter(order => order.driverId === this.selectedDriver);
      console.log('filter by driver-->', this.orders)
    } else {
      this.orders = [...this.ordersBackup];
    }
  }

  clearDriverFilter() {
    this.selectedDriver = null;
    this.orders = [...this.ordersBackup];
  }

}
