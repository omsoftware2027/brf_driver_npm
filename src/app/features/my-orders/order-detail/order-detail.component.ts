import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderDetailService } from '../../../core/services/order-detail.service';

@Component({
  selector: 'app-order-detail',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent {
  orderId!: string;
  searchText: string = '';
  orderDetail: any[] = [];
  totalProductCount: number = 0;
  customerDetails: any = {};

  tabs = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'pickup', label: 'Pickup', count: 0 },
    { key: '1', label: 'Jetro One', count: 0 },
    { key: '2', label: 'Jetro Two', count: 0 }
  ];

  activeTab: string = 'all';

  selectedStatus: { [key: number]: string } = {};

  constructor(private route: ActivatedRoute, public orderDetailService: OrderDetailService) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id')!;
    if (this.orderId) {
      this.getAllProducts();
      if (this.orderDetail.length) {

      }
    }
  }

  onSearch() {
    if (!this.searchText) {
      this.getAllProducts();
      return;
    }
    this.orderDetailService.searchProduct(this.orderId, this.searchText).subscribe({
      next: (res) => {
        this.orderDetail = res?.response?.products?.dataSet ?? [];
        console.log('searched', this.orderDetail)
      },
      error: (err) => {
        this.orderDetail = [];
      }
    });
  }

  setActiveTab(tab: any) {
    this.orderDetail = [];
    this.activeTab = tab.key;
    if (tab?.label === 'All') {
      this.getAllProducts();
    }
    if (tab?.label === 'Jetro One' || tab?.label === 'Jetro Two') {
      this.orderDetailService.getProductsByRoute(this.orderId, this.activeTab).subscribe({
        next: (res) => {
          this.orderDetail = res?.response?.products?.dataSet || [];
        },
        error: (err) => {
          this.orderDetail = [];
        }
      })
    }
    if (tab?.label === 'Pickup') {
      this.orderDetailService.getProductsByBinNo(this.orderId, this.activeTab).subscribe({
        next: (res) => {
          this.orderDetail = res?.response?.products?.dataSet || [];
        },
        error: (err) => {
          this.orderDetail = [];
        }
      })
    }
  }

  getAllProducts() {
    if (this.orderId) {
      this.orderDetailService.getAllproducts(this.orderId).subscribe({
        next: (res) => {
          this.orderDetail = res?.response?.products?.dataSet || [];
          this.totalProductCount = res?.response?.products?.totalElements ?? 0;
          // set customer details
          this.customerDetails = res?.response?.customer ?? {};
        },
        error: (err) => {
          this.orderDetail = []
        }
      })
    } else {
      console.log('Something wrong with the orderId')
    }
  }

  onStatusChange(product: any) {
    const remark = product.remark || '';
    debugger
    // this.orderDetailService.changeStatusOfProduct(product.productCode, product.confirmStatus, remark)
    //   .subscribe({
    //     next: (res) => {
    //       console.log('Product status updated successfully', res);
    //     },
    //     error: (err) => {
    //       console.error('Error updating product status', err);
    //     }
    //   });
  }

}
