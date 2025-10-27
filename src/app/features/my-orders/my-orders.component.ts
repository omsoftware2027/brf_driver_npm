import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
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
  lastSevenDayDate: string = '';
  user: any;
  searchText: string = '';
  searchResults: any[] = [];

  modalRef?: BsModalRef;
  selectedDriver: number | null = null;
  drivers: any[] = [];

  constructor(
    public orderService: OrderService,
    public authService: AuthService,
    private toastr: ToastrService,
    public router: Router,
    private modalService: BsModalService
  ) {
    const today = new Date();
    today.setDate(today.getDate() - 6);
    this.lastSevenDayDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.getAllDrivers();
    this.authService.user$.subscribe(
      user => {
        this.user = user;
        if (this.user && this.user.id) {
          this.orderService.getAllOrders(this.user?.id, this.lastSevenDayDate).subscribe({
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
    );
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

    this.orderService.searchOrders(this.user.id, this.lastSevenDayDate, this.searchText).subscribe({
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
    this.orderService.filterOrdersByDriver(this.lastSevenDayDate, this.searchText, this.selectedDriver).subscribe({
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

}
