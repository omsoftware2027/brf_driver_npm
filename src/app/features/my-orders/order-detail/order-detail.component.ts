import { CommonModule, DatePipe } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderDetailService } from '../../../core/services/order-detail.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';


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

  tabs: any[] = [];

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
  weightNotice = '';
  lookupFailed: boolean[] = [];
  weightInput: any = null;
  expiryDateInput: any;
  remarkInput: any

  itemsList: any[] = [];
  suggestedItemList: any[] = [];
  productList: any[] = [];

  productform!:FormGroup
  searchInput$ = new Subject<string>();

  currentCardId: number | null = null;
  currentScrollTop: number | null = null;

  selectedProductForMissing: any = null;
  previousStatusMap: any = {};

  productReplacementError: string = '';

  constructor(
    private route: ActivatedRoute,
    public orderDetailService: OrderDetailService,
    private modalService: BsModalService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder
  ) {
    this.productform = this.formBuilder.group({
      suggestedProductId: [null],
      productId: [null],
      quantity: [''],
    });
  }

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id')!;
    if (this.orderId) {
      this.getAllProducts();
      this.setupSearch();
      this.getallsampletype();
    }

    this.productform.get('suggestedProductId')?.valueChanges.subscribe(value => {
      this.productReplacementError = '';
      if (value) {
        this.productform.get('productId')?.disable({ emitEvent: false });
      } else {
        this.productform.get('productId')?.enable({ emitEvent: false });
      }
    });

    this.productform.get('productId')?.valueChanges.subscribe(value => {
      this.productReplacementError = '';
      if (value) {
        this.productform.get('suggestedProductId')?.disable({ emitEvent: false });
      } else {
        this.productform.get('suggestedProductId')?.enable({ emitEvent: false });
      }
    });

  }

  onSearch(): void {
  let binNumberFilter = '';
  let routeFilter: number | null = null;

  const binTabs = ['PICK UP', 'FREEZER', 'DRY', 'COOLER'];
  if (binTabs.includes(this.activeTab)) {
    binNumberFilter = this.activeTab;
  }
  // Determine filters for JETRO tabs
  switch (this.activeTab) {
    case 'JETRO':
      binNumberFilter = '^[0-9]+$';
      break;

    case 'JETRO ONE':
      routeFilter = 1;
      break;

    case 'JETRO TWO':
      routeFilter = 2;
      break;
  }
  // API call for filter 
  this.orderDetailService
    .searchProduct(this.orderId, this.searchText, routeFilter, binNumberFilter)
    .subscribe({
      next: (res) => {
        this.orderDetail = res?.response?.products?.dataSet ?? [];
        console.log('Searched:', this.orderDetail);
      },
      error: (err) => {
        console.error('Search failed:', err);
        this.orderDetail = [];
      }
    });
}


  setActiveTab(tab: any) {
    this.orderDetail = [];
    this.activeTab = tab;
    if (tab === 'All' && this.searchText==='') {
      this.getAllProducts();
    }
    this.onSearch();
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
      // console.log("items", this.itemsList);
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

  getAllProducts() {
    if (this.orderId) {
      this.orderDetailService.getAllproducts(this.orderId).subscribe({
        next: (res) => {
          this.orderDetail = res?.response?.products?.dataSet || [];
          this.tabs = ['All', ...new Set(res?.response?.products?.dataSet.map((item: any) => item.binNumber))];          
          this.activeTab = 'All';
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

  onMissingClick(event: any, product: any, template: TemplateRef<any>) {
    event.preventDefault();
    this.selectedProductForMissing = product;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered'
    });
  }

  onStatusChange(product: any) {
    this.previousStatusMap[product.orderItemId] = product.confirmStatus;
    this.updateStatus(product);
  }
  confirmMissing() {
    const product = this.selectedProductForMissing;
    if (!product) return;

    product.confirmStatus = 'Missing';

    this.previousStatusMap[product.orderItemId] = 'Missing';

    this.updateStatus(product);

    this.modalRef?.hide();
    this.selectedProductForMissing = null;
  }
  onCancelMissing() {
    this.modalRef?.hide();
    this.selectedProductForMissing = null;
  }
  updateStatus(product: any) {
    this.saveCurrentCardPosition(product.orderItemId);
    const remark = product.remark || '';
    this.orderDetailService
      .changeStatusOfProduct(product?.orderItemId, product?.confirmStatus, remark)
      .subscribe({
        next: (res) => {
          this.onSearchWithRestore(product.orderItemId);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  openWeightModal(template: TemplateRef<any>, product: any) {
    this.selectedProduct = product;
    this.selectedProductQuantity = parseInt(product?.qty, 10);
    this.inputValues = new Array(parseInt(product?.qty, 10)).fill('');
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
          this.onSearch();
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
    this.productReplacementError = '';
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
        } else {
          this.productReplacementError = res?.response || 'Something went wrong. Please try again.';
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

saveCurrentCardPosition(orderItemId: number) {
  this.currentCardId = orderItemId;
  this.currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
}

onSearchWithRestore(orderItemId: number) {
  this.onSearch();   // Run your existing search

  setTimeout(() => {
    this.restoreScroll(orderItemId);
  }, 300);
}

restoreScroll(orderItemId: number) {
  const element = document.getElementById("product-" + orderItemId);

  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else if (this.currentScrollTop !== null) {
    window.scrollTo({ top: this.currentScrollTop, behavior: 'smooth' });
  }
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
