import { Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { OrderDetailService } from '../../../core/services/order-detail.service';
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-grouped-order-details',
  standalone: false,
  templateUrl: './grouped-order-details.component.html',
  styleUrl: './grouped-order-details.component.scss'
})
export class GroupedOrderDetailsComponent {
  orderInfo: any = {};
  orderId!: string;
  searchText: string = '';
  orderDetail: any[] = [];
  customerDetails: any = {};
  shippingAddress: any;
  deliveryDate: any;

  tabs: any[] = [];

  activeTab: string = 'all';

  selectedStatus: { [key: number]: string } = {};

  modalRef?: BsModalRef;
  selectedProduct: any;
  selectedProductQuantity: number = 0;
  inputValues: string[] = [];
  checkInventoryStatus: boolean[] = [];
  inventoryIds: any;
  inputIndexToInventoryId: { [key: number]: number } = {};
  selectedInventoryIds: number[] = [];
  inventorylist: any;
  weightNotice = '';
  lookupFailed: boolean[] = [];
  weightInput: any = null;
  expiryDateInput: any;
  remarkInput: any

  itemsList: any[] = [];
  productList: any[] = [];

  productform!: FormGroup
  searchInput$ = new Subject<string>();

  selectedProductForMissing: any = null;

  suggestedItemList: any[] = [];

  constructor(
    private route: ActivatedRoute,
    public orderDetailService: OrderDetailService,
    private modalService: BsModalService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    public router: Router,
    public permissionService: PermissionService
  ) {
    this.productform = this.formBuilder.group({
      suggestedProductId: [null],
      productId: [null],
      quantity: [''],
    });
  }

  ngOnInit() {
    const idorders = this.route.snapshot.paramMap.get('id')!;
    this.orderId = idorders;

    this.route.queryParams.subscribe(params => {
      this.orderInfo = {
        idorders: this.orderId,
        userId: params['userId'],
        shippingDate: params['shippingDate'],
        shippingAddress: params['shippingAddress']
      };
    });

    if (this.orderId) {
      this.getAllProducts();
      this.setupSearch();
      this.getallsampletype();
    }

    this.productform.get('suggestedProductId')?.valueChanges.subscribe(value => {
      if (value) {
        this.productform.get('productId')?.disable({ emitEvent: false });
      } else {
        this.productform.get('productId')?.enable({ emitEvent: false });
      }
    });

    this.productform.get('productId')?.valueChanges.subscribe(value => {
      if (value) {
        this.productform.get('suggestedProductId')?.disable({ emitEvent: false });
      } else {
        this.productform.get('suggestedProductId')?.enable({ emitEvent: false });
      }
    });
  }

  onSearch(): void {
    this.getAllProducts();
  }

  setupSearch() {
    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.orderDetailService.getallproductlist(0, 600, term))
      )
      .subscribe(res => {
        if (res.status === 0) {
          this.itemsList = res.response.dataSet.map((product: any) => ({
            name: product.productName,
            productId: product.productId,
            description: product.description,
            shortDescription: product.shortDescription,
            code: product.code,
          }));
        }
      });
  }

  getallsampletype() {
    this.orderDetailService.getallproductlist(0, 600).subscribe((res) => {
      if (res['status'] === 0) {
        this.productList = res['response']['dataSet'];
        this.itemsList = this.productList.map((product) => {
          return {
            name: product.productName,
            productId: product.productId,
            description: product.description,
            shortDescription: product.shortDescription,
            code: product.code,
          };
        });
        console.log("items", this.itemsList);
      }
    });
  }

    getAllSuggestedItems(productId: number) {
    this.orderDetailService.getSuggestedProductList(productId).subscribe((res) => {
      if (Array.isArray(res)) {
        this.suggestedItemList = res || [];
      } else {
        this.suggestedItemList = [];
      }
    })
  }

  setActiveTab(tab: any) {
    this.orderDetail = [];
    this.activeTab = tab;
    if (tab === 'All' && this.searchText === '') {
      this.getAllProducts();
    }
    this.onSearch();
  }

  getAllProducts() {
    if (this.orderId) {
      this.orderDetailService.getAllGroupedOrdersProducts(
        this.orderInfo?.userId,
        this.orderInfo?.shippingAddress,
        this.orderInfo?.shippingDate,
        this.orderId,
        this.searchText
      ).subscribe({
        next: (res) => {
          this.orderDetail = res?.response?.productDetails || [];
          this.customerDetails = res?.response?.customerDetails ?? {};
          this.shippingAddress = res?.response?.shippingDetails['shippingAddress'];
          this.deliveryDate = res?.response?.orderDetails?.shippingDate || '';
          this.tabs = ['All', ...new Set(res?.response?.productDetails.map((item: any) => item?.bin))];
          this.activeTab = 'All';
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
    if (product.confirmStatus === 'Missing') {
      return;
    }
    this.updateStatus(product);
  }
  onMissingClick(event: any, product: any, template: TemplateRef<any>) {
    event.preventDefault();
    this.selectedProductForMissing = product;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered'
    });
  }
  confirmMissing() {
    const product = this.selectedProductForMissing;
    if (!product) return;
    product.confirmStatus = 'Missing';
    this.updateStatus(product);
    this.modalRef?.hide();
    this.selectedProductForMissing = null;
  }
  onCancelMissing() {
    this.modalRef?.hide();
    this.selectedProductForMissing = null;
  }
  updateStatus(product: any) {  
    const remark = product.remark || '';
    this.orderDetailService
      .changeStatusOfProduct(product?.orderItemId, product?.confirmStatus, remark)
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
    this.selectedProductQuantity = parseInt(product?.quantity, 10);
    this.inputValues = new Array(parseInt(product?.quantity, 10)).fill('');
    this.checkInventoryStatus = new Array(this.inputValues.length).fill(true);
    this.lookupFailed = new Array(this.inputValues.length).fill(false);
    this.selectedInventoryIds = [];
    this.inputIndexToInventoryId = {};
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
      class: 'modal-dialog-centered'
    });
  }
  sumbitInventory() {
    const weights: string[] = [];
    const maxQuantity = this.selectedProductQuantity;
    for (let i = 0; i < maxQuantity; i++) {
      const value = this.inputValues[i];
      const text = value === null || value === undefined ? '' : String(value).trim();
      weights.push(text === '' ? '0' : text);
    }
    this.orderDetailService.changeweight(weights, [], this.selectedProduct?.orderItemId).subscribe({
      next: (res: any) => {
        this.weightNotice = this.weightSaveNotice(res?.response);
        this.getAllProducts();
        this.modalRef?.hide();
      },
      error: () => {
        this.weightNotice = 'Inventory lookup failed. The entered weight is unchanged.';
      }
    });
  }
  weightSaveNotice(message: any): string {
    if (message === 'Weight saved successfully. No matching inventory was found.'
      || message === 'Weight saved successfully. Inventory lookup failed.') {
      return message;
    }
    return '';
  }
  generateArray(length: number): any[] {
    return new Array(length);
  }
  patchInventoryWeights(inventoryItems: any) {
    if (!inventoryItems || !inventoryItems.length) {
      return;
    }
    inventoryItems.forEach((item: any, slot: number) => {
      if (slot >= this.inputValues.length) {
        return;
      }
      const raw = item?.weight;
      const text = raw === null || raw === undefined ? '' : String(raw);
      this.inputValues[slot] = text === '0' ? '' : text;
    });
  }
  checkInventory(weightValue: any, index: number) {
    if (!this.inventoryIds) {
      this.inventoryIds = [];
    }
    if (!this.checkInventoryStatus) {
      this.checkInventoryStatus = [];
    }
    if (!this.lookupFailed) {
      this.lookupFailed = [];
    }
    if (!this.inputIndexToInventoryId) {
      this.inputIndexToInventoryId = [];
    }
    if (weightValue === '' || weightValue === null || weightValue === undefined) {
      this.inputValues[index] = '';
      this.checkInventoryStatus[index] = undefined as unknown as boolean;
      this.lookupFailed[index] = false;
      this.inputIndexToInventoryId[index] = 0;
    } else {
      this.inputValues[index] = weightValue;
      const entered = String(weightValue).trim();
      this.orderDetailService.checkWeightExists(entered, this.selectedProduct?.productCode, this.selectedProduct?.orderItemId).subscribe({
        next: (res) => {
          this.lookupFailed[index] = false;
          this.checkInventoryStatus[index] = !!res.response;
          const inventoryId = res.response !== undefined && res.response !== null ? res.response : 0;
          this.inputIndexToInventoryId[index] = inventoryId;
        },
        error: () => {
          this.inputValues[index] = weightValue;
          this.lookupFailed[index] = true;
          this.inputIndexToInventoryId[index] = 0;
          this.weightNotice = 'Inventory lookup failed. The entered weight is unchanged.';
        }
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
      class: 'modal-dialog-centered'
    });
  }
  saveExpiryDate() {
    const payload = {
      'dateType': this.selectedProduct?.dateType ?? 'expiry',
      'expOrProdDate': this.expiryDateInput ? this.datePipe.transform(this.expiryDateInput, 'MM/dd/yyyy') : '',
      'orderItemId': this.selectedProduct?.orderItemId,
      'productId': this.selectedProduct?.productId
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
      class: 'modal-dialog-centered'
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
      item.shortDescription?.toLowerCase().includes(term) ||
      item.code?.toLowerCase().includes(term)
    );
  }

  showProductReplaceModal(template: TemplateRef<any>, product: any) {
    this.productform.reset();
    this.getAllSuggestedItems(product.productId);
    this.selectedProduct = product;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered'
    });
  }
  changeproduct() {
    const form = this.productform.value;
    const selectedProductId = form.suggestedProductId || form.productId;

    this.orderDetailService.changeproduct(this.orderId, this.selectedProduct?.productId, selectedProductId, this.selectedProduct?.orderItemId, this.productform.value.quantity).subscribe({
      next: (res) => {
        if (res['status'] == 0) {
          this.modalRef?.hide();
          this.onSearch();
          this.productform.reset();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onImageError(event: any) {
    const img = event.target;
    if (!img.src.includes('no-image-available-placeholder.jpg')) {
      img.src = 'assets/images/no-image-available-placeholder.jpg';
    }
  }

  customSearch(term: string, item: any) {
    term = term.toLowerCase();
    return item.productName.toLowerCase().includes(term) ||
      item.sku.toLowerCase().includes(term);
  }
}
