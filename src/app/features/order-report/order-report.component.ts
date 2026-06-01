import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { OrderReportService } from '../../core/services/order-report.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderDetailService } from '../../core/services/order-detail.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-order-report',
  imports: [CommonModule, FormsModule, BsDatepickerModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './order-report.component.html',
  styleUrl: './order-report.component.scss',
  providers: [DatePipe]
})
export class OrderReportComponent {
  selectedOrderReportType: string = 'All';
  user: any;
  reports: any = {};
  allReportsBackup: any[] = [];

  expiryDateInput: any;
  selectedProduct: any;
  modalRef?: BsModalRef;

  selectedProductQuantity: number = 0;
  inputValues: string[] = [];
  checkInventoryStatus: boolean[] = [];
  inputIndexToInventoryId: { [key: number]: number } = {};
  inventorylist: any;
  inventoryIds: any;
  selectedInventoryIds: number[] = [];

  vendors: any[] = [];
  selectedVendor: string = '';
  selectedDate: string = '';

  selectedBinFilter: string = '';
  binSortAscending: boolean = true;
  routeSortAscending: boolean = true;
  selectedCustomerFilter: string = '';

  jetroOneCustomers: any[] = [];
  jetroTwoCustomers: any[] = [];

  itemsList: any[] = [];
  productList: any[] = [];
  productform!: FormGroup;
  searchInput$ = new Subject<string>();

  remarkInput: any

  searchText: string = '';
  pageNo = 0;
  pageSize = 30000;
  totalPages = 0;
  totalElements = 0;
  Math = Math;

  selectedProductForMissing: any = null;

  suggestedItemList: any[] = [];

  constructor(
    public orderReportService: OrderReportService,
    public authService: AuthService,
    public orderDetailService: OrderDetailService,
    public datePipe: DatePipe,
    public modalService: BsModalService,
    private formBuilder: FormBuilder
  ) { 
    this.productform = this.formBuilder.group({
      suggestedProductId: [null],
      productId: [null],
      quantity: [''],
    });
  };

  ngOnInit() {
    this.authService.user$.subscribe(
      user => {
        this.user = user;
        const today = new Date();
        this.selectedDate = today.toISOString().split('T')[0] || '';
        this.getAllOrderItems(this.selectedDate);
        this.setupSearch();
        this.getallsampletype();
      }
    )

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

  getCustomers(jetroType: any) {
    if (jetroType === 1) {
      this.orderReportService.getCustomers(1, this.selectedDate).subscribe((res: any) => {
        this.jetroOneCustomers = res?.response || [];
      })
    }
    if (jetroType === 2) {
      this.orderReportService.getCustomers(2, this.selectedDate).subscribe((res: any) => {
        this.jetroTwoCustomers = res?.response || [];
      })
    }
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

  setOrderReportType(type: string) {
    this.selectedBinFilter = '';
    this.selectedVendor = '';
    this.selectedCustomerFilter = '';
    this.binSortAscending = true;
    this.routeSortAscending = true;
    this.searchText = '';
    this.pageNo = 0;
    this.pageSize = 30;
    this.totalElements = 0;

    this.selectedOrderReportType = type;

    if (this.selectedOrderReportType === 'All') {
      this.getAllOrderItems(this.selectedDate);
    }
    if (this.selectedOrderReportType === 'Pickup') {
      this.getPickupReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Jetro One') {
      this.getJetroOneReport(this.selectedDate, this.searchText, this.selectedCustomerFilter, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Jetro Two') {
      this.getJetroTwoReport(this.selectedDate, this.searchText, this.selectedCustomerFilter, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Warehouse') {
      this.getWarehouseReport(this.selectedDate, this.searchText, this.selectedBinFilter, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Freezer One') {
      this.getFreezerOneReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Freezer Two') {
      this.getFreezerTwoReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
  }

  getAllOrderItems(date: string) {
    this.orderReportService.getAllOrderReport(date).subscribe({
      next: (res) => {
        const data = res?.response || [];
        data.length > 0 ?
          this.reports = [
            {
              vendor: 'All Orders',
              items: data
            }
          ] : this.reports = [];
        
        this.allReportsBackup = [...this.reports];
        this.vendors = ['All Orders'];
      },
      error: (err) => {
        this.reports = [];
        this.allReportsBackup = [];
        this.vendors = [];
      }
    });
  }

  getPickupReport(date: string, searchText: string, pageNo: any, pageSize: any) {
    this.orderReportService.getPickupReports(date, searchText, pageNo, pageSize).subscribe({
      next: (res) => {
        const dataSet = res?.response?.dataSet || {};
        const formattedReports = Object.entries(dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
        this.reports = formattedReports;
        this.allReportsBackup = [...formattedReports];
        this.vendors = Object.keys(res?.response?.dataSet);
        this.totalPages = res?.response?.totalPages || 0;
        this.totalElements = res?.response?.totalElements || 0;
        if(this.selectedVendor){
          this.applyVendorFilter()
        }
      },
      error: (err) => {
        console.error('something is wrong...', err);
        this.reports = [];
        this.allReportsBackup = [];
        this.vendors = [];
      }
    })
  }
  getJetroOneReport(date: string, search?: string, customerName?: string, pageNo?: any, pageSize?: any) {
    this.orderReportService.getJetroOneReports(date, search, customerName, pageNo, pageSize).subscribe({
      next: (res) => {
        const dataSet = res?.response?.dataSet || {};
        const formattedReports = Object.entries(dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
        this.reports = formattedReports;
        this.allReportsBackup = [...formattedReports];
        this.totalPages = res?.response?.totalPages || 0;
        this.totalElements = res?.response?.totalElements || 0;
      },
      error: (err) => {
        console.error('something is wrong...', err);
        this.reports = [];
        this.allReportsBackup = [];
      }
    })
    this.getCustomers(1);
  }
  getJetroTwoReport(date: string, search?: string, customerName?: string, pageNo?: any, pageSize?: any) {
    this.orderReportService.getJetroTwoReports(date, search, customerName, pageNo, pageSize).subscribe({
      next: (res) => {
        const dataSet = res?.response?.dataSet || {};
        const formattedReports = Object.entries(dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
        this.reports = formattedReports;
        this.allReportsBackup = [...formattedReports];
        this.totalPages = res?.response?.totalPages || 0;
        this.totalElements = res?.response?.totalElements || 0;
      },
      error: (err) => {
        console.error('something is wrong...', err);
        this.reports = [];
        this.allReportsBackup = [];
      }
    })
    this.getCustomers(2);
  }
  getWarehouseReport(date: any, search: string, binFilter: any, pageNo: any, pageSize: any) {
    this.orderReportService.getWarehouseReports(date, search, binFilter, pageNo, pageSize).subscribe({
      next: (res) => {
        const dataSet = res?.response?.dataSet || {};
        const formattedReports = Object.entries(dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
        this.reports = formattedReports;
        this.allReportsBackup = [...formattedReports];
        this.totalPages = res?.response?.totalPages || 0;
        this.totalElements = res?.response?.totalElements || 0;
      },
      error: (err) => {
        console.error('something is wrong...', err);
        this.reports = [];
        this.allReportsBackup = [];
      }
    })
  }
  getFreezerOneReport(date: any, search: string, pageNo: any, pageSize: any) {
    this.orderReportService.getFreezerOneReports(date, search, pageNo, pageSize).subscribe({
      next: (res) => {
        const dataSet = res?.response?.dataSet || {};
        const formattedReports = Object.entries(dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
        this.reports = formattedReports;
        this.allReportsBackup = [...formattedReports];
        this.totalPages = res?.response?.totalPages || 0;
        this.totalElements = res?.response?.totalElements || 0;
      },
      error: (err) => {
        console.error('something is wrong...', err);
        this.reports = [];
        this.allReportsBackup = [];
      }
    })
  }
  getFreezerTwoReport(date: any, search: string, pageNo: any, pageSize: any) {
    this.orderReportService.getFreezerTwoReports(date, search, pageNo, pageSize).subscribe({
      next: (res) => {
        const dataSet = res?.response?.dataSet || {};
        const formattedReports = Object.entries(dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
        this.reports = formattedReports;
        this.allReportsBackup = [...formattedReports];
        this.totalPages = res?.response?.totalPages || 0;
        this.totalElements = res?.response?.totalElements || 0;        
      },
      error: (err) => {
        console.error('something is wrong...', err);
        this.reports = [];
        this.allReportsBackup = [];
      }
    })
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

  openWeightModal(template: TemplateRef<any>, product: any) {
    this.selectedProduct = product;
    this.selectedProductQuantity = parseInt(product?.quantity, 10);
    this.inputValues = new Array(parseInt(product?.quantity, 10)).fill('');
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
      class: 'modal-dialog-centered'
    });
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

        // if inventoryCodeAndWeightProjections is [] set weight from the selectedProduct.inventoryItems[];
        if (this.selectedProduct?.inventoryItems?.length > 0) {
          this.selectedProduct?.inventoryItems.forEach((item: any, index: number) => {
            if (index < this.inputValues.length) {
              this.inputValues[index] = String(item.weight ?? '');
            }
          });
        }
      }
    }
    console.log('Finished patchInventoryWeights');
    console.log('Updated inputValues:', this.inputValues);
  }
  generateArray(length: number): any[] {
    return new Array(length);
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
      this.orderDetailService.checkWeightExists(weight, this.selectedProduct?.sku, this.selectedProduct?.orderItemId).subscribe((res) => {
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
      this.getOrdersReports(this.selectedOrderReportType);
      this.modalRef?.hide();
    });
  }

  // pickup filter works
  openVendorModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered',
    });
  }
  applyVendorFilter() {
    if (this.selectedVendor && this.selectedVendor !== '') {
      // Filter from backup, not from main reports
      this.reports = this.allReportsBackup.filter(
        report => report.vendor.trim() === this.selectedVendor.trim()
      );
    } else {
      // Restore original unfiltered data
      this.reports = [...this.allReportsBackup];
    }
  }

  onDateChange(event: Event) {
    const selectedDate = (event.target as HTMLInputElement).value;
    this.selectedDate = selectedDate || '';
    this.getOrdersReports(this.selectedOrderReportType);
  }



  // warehouse filter works
  applyBinFilter() {
    this.getOrdersReports(this.selectedOrderReportType)
  }

  // jetro filters works
  applyCustomerFilter() {
    this.getOrdersReports(this.selectedOrderReportType)
  }

  sortByBinNumber() {
    this.reports.forEach((report: any) => {
      report.items.sort((a: any, b: any) => {
        const binA = a.binNumber?.trim().toUpperCase() || '';
        const binB = b.binNumber?.trim().toUpperCase() || '';

        const numA = parseFloat(binA);
        const numB = parseFloat(binB);

        let comparison = 0;

        if (!isNaN(numA) && !isNaN(numB)) {
          comparison = numA - numB;
        }
        else {
          comparison = binA.localeCompare(binB, undefined, { numeric: true, sensitivity: 'base' });
        }

        return this.binSortAscending ? comparison : -comparison;
      });
    });

    this.binSortAscending = !this.binSortAscending;
  }

  sortByRoute() {
    this.reports.forEach((report: any) => {
      report.items.sort((a: any, b: any) => {
        const routeA = a.route?.trim().toUpperCase() || '';
        const routeB = b.route?.trim().toUpperCase() || '';

        const numA = parseFloat(routeA);
        const numB = parseFloat(routeB);

        let comparison = 0;

        if (!isNaN(numA) && !isNaN(numB)) {
          comparison = numA - numB;
        }
        else {
          comparison = routeA.localeCompare(routeB, undefined, { numeric: true, sensitivity: 'base' });
        }
        return this.routeSortAscending ? comparison : -comparison;
      });
    });

    this.routeSortAscending = !this.routeSortAscending;
  }

  clearDateFilter() {
    this.selectedDate = '';
    this.getOrdersReports(this.selectedOrderReportType);
  }



  // onStatusChange(product: any) {
  //   const remark = product.remark || '';
  //   this.orderDetailService.changeStatusOfProduct(product?.orderItemId, product?.confirmStatus, remark)
  //     .subscribe({
  //       next: (res) => {
  //         this.getOrdersReports(this.selectedOrderReportType);
  //       },
  //       error: (err) => {
  //         console.error('Error updating product status', err);
  //       }
  //     });
  // }

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
    this.orderDetailService.changeStatusOfProduct(product?.orderItemId, product?.confirmStatus, remark)
      .subscribe({
        next: (res) => {
          this.getOrdersReports(this.selectedOrderReportType);
        },
        error: (err) => {
          console.error('Error updating product status', err);
        }
      });
  }

  showProductReplaceModal(template: TemplateRef<any>, product: any) {
    this.productform.reset();
    this.getAllSuggestedItems(product.productId);
    this.selectedProduct = product;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-dialog-centered'
    });
  }
  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  changeproduct() {
    const form = this.productform.value;
    const selectedProductId = form.suggestedProductId || form.productId;

    this.orderDetailService.changeproduct(this.selectedProduct?.orderId, this.selectedProduct?.productId, selectedProductId, this.selectedProduct?.orderItemId, this.productform.value.quantity).subscribe({
      next: (res) => {
        if (res['status'] == 0) {
          this.modalRef?.hide();
          this.setOrderReportType(this.selectedOrderReportType);
          this.productform.reset();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
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
          this.getOrdersReports(this.selectedOrderReportType);
        },
        error: (err) => {
          console.error('Error saving weight', err);
        }
      });
  }

  onSearch() {
    this.selectedVendor = '';
    this.getOrdersReports(this.selectedOrderReportType);
  }

  getOrdersReports(type: any) {
    this.selectedOrderReportType = type;
    if (this.selectedOrderReportType === 'All') {
      this.getAllOrderItems(this.selectedDate);
    }
    if (this.selectedOrderReportType === 'Pickup') {
      this.getPickupReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Jetro One') {
      this.getJetroOneReport(this.selectedDate, this.searchText, this.selectedCustomerFilter, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Jetro Two') {
      this.getJetroTwoReport(this.selectedDate, this.searchText, this.selectedCustomerFilter, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Warehouse') {
      this.getWarehouseReport(this.selectedDate, this.searchText, this.selectedBinFilter, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Freezer One') {
      this.getFreezerOneReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Freezer Two') {
      this.getFreezerTwoReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.pageNo = newPage;
      this.getOrdersReports(this.selectedOrderReportType);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  get displayPageNo(): number {
    return this.pageNo + 1;
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
