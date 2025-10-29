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
  @ViewChild('dateFilterInput') dateFilterInput!: ElementRef<HTMLInputElement>;


  constructor(
    public orderService: OrderService,
    public authService: AuthService,
    private toastr: ToastrService,
    public router: Router,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.getAllDrivers();
    this.authService.user$.subscribe(
      user => {
        this.user = user;
        this.getTodaysOrders();
      }
    );
  }

  getTodaysOrders() {
    if (this.user && this.user.id) {
      const today = new Date();
      this.todayDate = today.toISOString().split('T')[0];

      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1);
      const endDate = nextDay.toISOString().split('T')[0];

      this.orderService.getAllOrders(this.user?.id, this.todayDate, endDate).subscribe({
        next: (res) => {
          this.orders = res?.response?.dataSet || [];
          this.orders.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
          if (this.orders.length === 0) {
            // this.toastr.info('No orders found in the last 7 days', 'Info');
          }
        },
        error: (err) => {
          this.toastr.error('Failed to fetch orders. Please try again later.', 'Error');
        }
      })
    } else {
      // this.toastr.warning('You need to login', 'Warning');
    }
  }

  getAllDrivers() {
    this.orderService.getAllDrivers().subscribe({
      next: (res) => {
        this.drivers = res.response || [];
      }
    })
  }


  onSearch() {
    if (!this.user?.id || !this.searchText) {
      this.searchResults = [];
      return;
    }

    this.orderService.searchOrders(this.user.id, this.todayDate, this.searchText).subscribe({
      next: (res) => {
        this.searchResults = res?.response?.dataSet || [];
        console.log('searched', this.searchResults)
      },
      error: (err) => {
        this.toastr.error('Search failed. Please try again.', 'Error');
        this.searchResults = [];
      }
    });
  }

  viewOrderDetails(transactionId: string) {
    // this.router.navigate([])
  }


  openDriverModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
  }

  applyDriverFilter() {
    console.log('Selected driver:', this.selectedDriver);
    this.modalRef?.hide();
    this.orderService.filterOrdersByDriver(this.todayDate, this.searchText, this.selectedDriver).subscribe({
      next: (res) => {
        this.orders = res?.response?.dataSet || [];
        console.log('searched', this.orders)
      },
      error: (err) => {
        this.toastr.error('Search failed. Please try again.', 'Error');
        this.orders = [];
      }
    });
  }

  triggerDatePicker() {
    this.dateFilterInput.nativeElement.showPicker();
  }
  onDateChange(event: Event) {
    const selectedDate = (event.target as HTMLInputElement).value;
    this.selectedDate = selectedDate || '';

    const startDate = new Date(this.selectedDate);
    const nextDay = new Date(startDate);
    nextDay.setDate(startDate.getDate() + 1);

    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = nextDay.toISOString().split('T')[0];

    this.orderService.getAllOrders(this.user?.id, formattedStartDate, formattedEndDate).subscribe({
      next: (res) => {
        this.orders = res?.response?.dataSet || [];
        this.orders.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
      },
      error: (err) => {
        this.toastr.error('Failed to fetch orders. Please try again later.', 'Error');
      }
    })

  }

  clearDateFilter() {
    this.selectedDate = '';
    this.getTodaysOrders();
  }
}
