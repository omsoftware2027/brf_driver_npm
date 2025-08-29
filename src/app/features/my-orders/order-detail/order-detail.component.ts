import { CommonModule, DatePipe } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderDetailService } from '../../../core/services/order-detail.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-order-detail',
  imports: [RouterModule, CommonModule, FormsModule, BsDatepickerModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  providers: [DatePipe]
})
export class OrderDetailComponent {
  orderId!: string;
  searchText: string = '';
  orderDetail: any[] = [];
  allProductsCount: number = 0;
  pickupProductsCount: number = 0;
  jetroOneProdcutsCount: number = 0;
  jetroTwoProductsCount: number = 0;
  customerDetails: any = {};

  tabs = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'pickup', label: 'Pickup', count: 0 },
    { key: '1', label: 'Jetro One', count: 0 },
    { key: '2', label: 'Jetro Two', count: 0 }
  ];

  activeTab: string = 'all';

  selectedStatus: { [key: number]: string } = {};

  modalRef?: BsModalRef;
  selectedProduct: any;
  weightInput: any = null;
  expiryDateInput: any;
  remarkInput: any


  constructor(
    private route: ActivatedRoute,
    public orderDetailService: OrderDetailService,
    private modalService: BsModalService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id')!;
    if (this.orderId) {
      this.getProductsCountsForTabs(this.orderId);
      this.getAllProducts();
    }
  }

  getProductsCountsForTabs(orderId: any) {
    this.orderDetailService.getProductsCounts(orderId).subscribe({
      next: (res: any) => {
        this.allProductsCount = res?.response?.allProductsCount ?? 0;
        this.pickupProductsCount = res?.response?.pickupProductsCount ?? 0;
        this.jetroOneProdcutsCount = res?.response?.jetroOneProdcutsCount ?? 0;
        this.jetroTwoProductsCount = res?.response?.jetroTwoProductsCount ?? 0;
        this.tabs = [
          { key: 'all', label: 'All', count: this.allProductsCount },
          { key: 'pickup', label: 'Pickup', count: this.pickupProductsCount },
          { key: '1', label: 'Jetro One', count: this.jetroOneProdcutsCount },
          { key: '2', label: 'Jetro Two', count: this.jetroTwoProductsCount }
        ];
      },
      error: (err)=>{
        console.log('Something is wrong', err)
      }
    })
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
    this.orderDetailService.changeStatusOfProduct(product?.orderItemId, product?.confirmStatus, remark)
      .subscribe({
        next: (res) => {
          console.log('Product status updated successfully', res);
        },
        error: (err) => {
          console.error('Error updating product status', err);
        }
      });
  }

  openWeightModal(template: TemplateRef<any>, product: any) {
    this.selectedProduct = product;
    this.weightInput = product.weight || null;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered modal-sm'
    });
  }
  saveWeight() {
    // this.orderDetailService.saveWeight(this.selectedProduct.orderItemId, this.weightInput)
    //   .subscribe({
    //     next: (res) => {
    //       this.modalRef?.hide();
    //       this.getAllProducts();
    //     },
    //     error: (err) => {
    //       console.error('Error saving weight', err);
    //     }
    //   });
  }

  openExpiryDateModal(template: TemplateRef<any>, product: any) {
    this.expiryDateInput = null;
    this.orderDetailService.getProductExpiryDates(product?.orderItemId, product?.productId).subscribe({
      next: (res: any) => {
        if (res?.status === 0) {
          this.expiryDateInput = res?.response?.expOrProdDate ? this.datePipe.transform(res?.response?.expOrProdDate, 'MM/dd/yyyy') : '';
        } else {
          this.expiryDateInput = null;
        }
      }
    })
    this.selectedProduct = product;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered modal-sm'
    });
  }
  saveExpiryDate() {
    const payload = {
      'ordersIdOrders': this.selectedProduct?.orderItemId,
      'productId': this.selectedProduct?.productId,
      'dateType': this.selectedProduct?.dateType ?? 'expiry',
      'expOrProdDate': this.expiryDateInput ? this.datePipe.transform(this.expiryDateInput, 'MM/dd/yyyy') : ''
    };
    this.orderDetailService.setProductExpiryDate(payload).subscribe({
      next: (res: any) => {
        if (res.status === 0) {
          this.modalRef?.hide();
          this.expiryDateInput = null;
        }
      },
      error: (err) => {
        console.error('Something is wrong..')
      }
    })
  }

  openRemarkModal(template: TemplateRef<any>, product: any) {
    this.selectedProduct = product;
    this.remarkInput = product?.remark ?? ''
    this.modalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered modal-sm'
    });
  }
  saveRemark() {
    this.orderDetailService.saveRemark(this.selectedProduct.orderItemId, this.remarkInput)
      .subscribe({
        next: (res) => {
          this.modalRef?.hide();
          this.getAllProducts();
        },
        error: (err) => {
          console.error('Error saving weight', err);
        }
      });
  }

}
