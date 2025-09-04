import { CommonModule, DatePipe } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderDetailService } from '../../../core/services/order-detail.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-order-detail',
  imports: [RouterModule, CommonModule, FormsModule, BsDatepickerModule, ReactiveFormsModule, NgSelectModule],
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
  selectedProductQuantity: number = 0;
  inputValues: string[] = [];
  checkInventoryStatus: boolean[] = [];
  inventoryIds:any;
  inputIndexToInventoryId: { [key: number]: number } = {};
  selectedInventoryIds: number[] = [];
  inventorylist:any;
  weightInput: any = null;
  expiryDateInput: any;
  remarkInput: any

  itemsList: any[] = [];
  productList: any[] = [];

  productform!:FormGroup


  constructor(
    private route: ActivatedRoute,
    public orderDetailService: OrderDetailService,
    private modalService: BsModalService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder
  ) {
        this.productform = this.formBuilder.group({
      productId:[''],
      quantity: [''],
    });
   }

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id')!;
    if (this.orderId) {
      this.getProductsCountsForTabs(this.orderId);
      this.getAllProducts();
      this.getAllProductList()
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
    let pickupFilter = '';
    let routeFilter = '';
    if (this.activeTab === 'pickup') {
      pickupFilter = this.activeTab
    } else if(this.activeTab === '1' || this.activeTab === '2') {
      routeFilter = this.activeTab
    }
    this.orderDetailService.searchProduct(this.orderId, this.searchText, routeFilter, pickupFilter).subscribe({
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
    if (tab?.label === 'All' && this.searchText==='') {
      this.getAllProducts();
    }

    this.onSearch();
    // if (tab?.label === 'Jetro One' || tab?.label === 'Jetro Two') {
    //   this.orderDetailService.getProductsByRoute(this.orderId, this.activeTab).subscribe({
    //     next: (res) => {
    //       this.orderDetail = res?.response?.products?.dataSet || [];
    //     },
    //     error: (err) => {
    //       this.orderDetail = [];
    //     }
    //   })
    // }
    // if (tab?.label === 'Pickup') {
    //   this.orderDetailService.getProductsByBinNo(this.orderId, this.activeTab).subscribe({
    //     next: (res) => {
    //       this.orderDetail = res?.response?.products?.dataSet || [];
    //     },
    //     error: (err) => {
    //       this.orderDetail = [];
    //     }
    //   })
    // }
  }

  getAllProductList() {
    this.orderDetailService.getallproductlist(0, 600).subscribe((res) => {
      if (res['status'] === 0) {
        this.productList = res['response']['dataSet'];
        this.itemsList = this.productList.map((product) => {
          return {
            name: product.productName,
            productId: product.productId,
            description: product.description,
            shortDescription: product.shortDescription
          };
        });
      }
    });
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
          this.onSearch();
        },
        error: (err) => {
          console.error('Error updating product status', err);
        }
      });
  }

  openWeightModal(template: TemplateRef<any>, product: any) {
    this.selectedProduct = product;
    this.selectedProductQuantity = parseInt(product?.qty, 10);
    this.inputValues = new Array(parseInt(product?.qty, 10)).fill('');
    this.checkInventoryStatus = new Array(this.inputValues.length).fill(true);
    this.orderDetailService.getOrderProductInventoryedit(product?.productId, product?.orderItemId).subscribe(
      (res) => {
        if (res['status'] == 0) {
          this.inventorylist = res.response.inventoryCodeAndWeightProjections;
          let isSold = false;
          if (res.response?.inventoryCodeAndWeightProjections) {
            res.response.inventoryCodeAndWeightProjections.forEach((element: any) => {
              if (element.isSold === true) {
                isSold = true;
              }
            });
          }
          this.patchInventoryWeights(product?.inventoryItems);
        }
      })

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
    sumbitInventory() {
    const weights: number[] = [];
    const inventoryIds: number[] = [];
    const maxQuantity = this.selectedProductQuantity;
    for (let i = 0; i < maxQuantity; i++) {
      const value = this.inputValues[i];
      const weight = this.isValidNumber(value) ? parseFloat(value) : 0;
      const inventoryId = this.selectedInventoryIds[i] || this.inputIndexToInventoryId[i] || 0;
      weights.push(weight);
      inventoryIds.push(inventoryId);
    }
    // Log the extracted inventory IDs and weights
    console.log('Inventory IDs:', inventoryIds);
    console.log('Weights:', weights);
    // Use the limited inventoryIds and weights arrays when calling the service
    this.orderDetailService.changeweight(weights, inventoryIds, this.selectedProduct?.orderItemId).subscribe((res) => {
      this.getAllProducts();
      this.modalRef?.hide();
    });
  }
  generateArray(length: number): any[] {
    return new Array(length);
  }
  patchInventoryWeights(inventoryItems: any) {
    console.log('Starting patchInventoryWeights');
    const seenWeights = new Set<string>();
    for (const inventoryItem of inventoryItems) {
      const weight = String(inventoryItem.weight);
      const inventoryId = (inventoryItem.inventoryId);
      const index = this.inventorylist.findIndex((item: any) => item.inventoryId === inventoryId);
      if (index !== -1) {
        if (!seenWeights.has(weight)) {
          seenWeights.add(weight);
          this.inputValues[index] = weight;
        } else {
          this.inputValues[index] = weight;
          console.log('Duplicate Record:', weight);
        }
        console.log('Patched Weight:', weight);
      } else {
        console.log('Inventory item not found:', inventoryItem);
      }
    }
    console.log('Finished patchInventoryWeights');
    console.log('Updated inputValues:', this.inputValues);
  }
  checkInventory(weightValue: any, index: number) {
    console.log('Checking Inventory for weight:', weightValue);
    const weight = this.isValidNumber(weightValue) ? parseFloat(weightValue) : 0;
    if (!this.inventoryIds) {
      this.inventoryIds = [];
    }
    if (!this.checkInventoryStatus) {
      this.checkInventoryStatus = [];
    }
    if (!this.inputIndexToInventoryId) {
      this.inputIndexToInventoryId = [];
    }
    if (weightValue === '' || weightValue === null || weightValue === undefined) {
      // Clear the input value and reset the inventory status when weightValue is empty
      this.inputValues[index] = '';
      this.checkInventoryStatus[index] = undefined as unknown as boolean; // Use 'undefined as boolean' to explicitly set it as boolean or undefined
      this.inputIndexToInventoryId[index] = 0;
    } else {
      // Perform inventory check when weightValue is not empty
      this.inputValues[index] = weightValue;
      this.orderDetailService.checkWeightExists(weight, this.selectedProduct?.productCode, this.selectedProduct?.orderItemId).subscribe((res) => {
        this.checkInventoryStatus[index] = !!res.response; // Convert to boolean
        const inventoryId = res.response !== undefined ? res.response : 0;
        console.log('Received inventoryId:', inventoryId);
        this.inputIndexToInventoryId[index] = inventoryId;
      });
    }
  }
  isValidNumber(value: any) {
    return !isNaN(parseFloat(value));
  }
  get totalWeight(): number {
  return this.inputValues.reduce((sum, val) => sum + (+val || 0), 0);
}



  openExpiryDateModal(template: TemplateRef<any>, product: any) {
    this.expiryDateInput = null;
    this.orderDetailService.getProductExpiryDates(product?.orderItemId, product?.productId).subscribe({
      next: (res: any) => {
        if (res?.status === 0) {
          this.expiryDateInput = res?.response?.expOrProdDate ? this.datePipe.transform(res?.response?.expOrProdDate, 'MM/dd/yyyy') : '';
        } else {
          this.expiryDateInput = product?.expOrProdDate ? this.datePipe.transform(product?.expOrProdDate, 'MM/dd/yyyy') : null;
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
          this.onSearch();
        },
        error: (err) => {
          console.error('Error saving weight', err);
        }
      });
  }


  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  customSearchFn(term: string, item: any): boolean {
    term = term.toLowerCase();
    return (
      item.name?.toLowerCase().includes(term) ||
      item.productId?.toString().toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.shortDescription?.toLowerCase().includes(term)
    );
  }
  
  showProductReplaceModal(template: TemplateRef<any>, product: any) {
    this.selectedProduct = product;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered modal-sm'
    });
  }
  changeproduct() {
    this.orderDetailService.changeproduct(this.orderId, this.selectedProduct?.productId, this.productform.value.productId, this.selectedProduct?.orderItemId, this.productform.value.quantity).subscribe((res) => {
      if (res['status'] == 0) {
        this.modalRef?.hide();
        this.onSearch();
        this.productform.reset();
      }
    });
  }
}
