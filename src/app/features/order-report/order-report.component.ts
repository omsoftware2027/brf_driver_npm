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
  selectedOrderReportType: string = 'Pickup';
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

  customers: any[] = [];

  itemsList: any[] = [];
  productList: any[] = [];
  productform!: FormGroup;
  searchInput$ = new Subject<string>();

  remarkInput: any

  searchText: string = '';
  pageNo = 0;
  pageSize = 30;
  totalPages = 0;
  totalElements = 0;
  Math = Math;

  constructor(
    public orderReportService: OrderReportService,
    public authService: AuthService,
    public orderDetailService: OrderDetailService,
    public datePipe: DatePipe,
    public modalService: BsModalService,
    private formBuilder: FormBuilder
  ) { 
    this.productform = this.formBuilder.group({
      productId: [''],
      quantity: [''],
    });
  };

  ngOnInit() {
    this.authService.user$.subscribe(
      user => {
        this.user = user;
        this.getPickupReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
        this.setupSearch();
        this.getallsampletype();
      }
    )
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

  setOrderReportType(type: string) {
    this.selectedBinFilter = '';
    this.selectedVendor = '';
    this.selectedCustomerFilter = '';
    this.selectedDate = '';
    this.binSortAscending = true;
    this.routeSortAscending = true;
    this.searchText = '';
    this.pageNo = 0;
    this.pageSize = 30;
    this.totalElements = 0;

    this.selectedOrderReportType = type;
    if (this.selectedOrderReportType === 'Pickup') {
      this.getPickupReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Jetro One') {
      this.getJetroOneReport(this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Jetro Two') {
      this.getJetroTwoReport(this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Warehouse') {
      this.getWarehouseReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Freezer One') {
      this.getFreezerOneReport(this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Freezer Two') {
      this.getFreezerTwoReport(this.searchText, this.pageNo, this.pageSize);
    }
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
      },
      error: (err) => {
        console.error('something is wrong...', err);
        this.reports = [];
        this.allReportsBackup = [];
        this.vendors = [];
      }
    })
  }
  getJetroOneReport(search?: string, pageNo?: any, pageSize?: any) {
    this.customers = [];
    this.orderReportService.getJetroOneReports(search, pageNo, pageSize).subscribe({
      next: (res) => {
        const dataSet = res?.response?.dataSet || {};
        const formattedReports = Object.entries(dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
        this.reports = formattedReports;
        this.allReportsBackup = [...formattedReports];
        // Collect unique userName from all items
        const userNameSet = new Set<string>();
        formattedReports.forEach(report => {
          report?.items.forEach((item: any) => {
            if (item?.userName) {
              userNameSet.add(item.userName.trim());
            }
          });
        });
        this.customers = Array.from(userNameSet);
        this.totalPages = res?.response?.totalPages || 0;
        this.totalElements = res?.response?.totalElements || 0;
      },
      error: (err) => {
        console.error('something is wrong...', err);
        this.reports = [];
        this.allReportsBackup = [];
        this.customers = [];
      }
    })
  }
  getJetroTwoReport(search?: string, pageNo?: any, pageSize?: any) {
    this.customers = [];
    this.orderReportService.getJetroTwoReports(search, pageNo, pageSize).subscribe({
      next: (res) => {
        const dataSet = res?.response?.dataSet || {};
        const formattedReports = Object.entries(dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
        this.reports = formattedReports;
        this.allReportsBackup = [...formattedReports];
        // Collect unique userName from all items
        const userNameSet = new Set<string>();
        formattedReports.forEach(report => {
          report?.items.forEach((item: any) => {
            if (item?.userName) {
              userNameSet.add(item?.userName.trim());
            }
          });
        });
        this.customers = Array.from(userNameSet);
        this.totalPages = res?.response?.totalPages || 0;
        this.totalElements = res?.response?.totalElements || 0;
      },
      error: (err) => {
        console.error('something is wrong...', err);
        this.reports = [];
        this.allReportsBackup = [];
        this.customers = [];
      }
    })
  }
  getWarehouseReport(date: any, search: string, pageNo: any, pageSize: any) {
    this.orderReportService.getWarehouseReports(date, search, pageNo, pageSize).subscribe({
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
  getFreezerOneReport(search: string, pageNo: any, pageSize: any) {
    this.orderReportService.getFreezerOneReports(search, pageNo, pageSize).subscribe({
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
  getFreezerTwoReport(search: string, pageNo: any, pageSize: any) {
    this.orderReportService.getFreezerTwoReports(search, pageNo, pageSize).subscribe({
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
      this.setOrderReportType(this.selectedOrderReportType)
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

  onDateChange(event: Event, reportType: string) {
    const selectedDate = (event.target as HTMLInputElement).value;
    this.selectedDate = selectedDate || '';
    if (reportType === 'warehouse') {
      this.getWarehouseReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
    if (reportType === 'pickup') {
      this.getPickupReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
  }



  // warehouse filter works
  applyBinFilter() {
    if (!this.selectedBinFilter) {
      this.reports = [...this.allReportsBackup];
      return;
    }
    this.reports = this.allReportsBackup
      .map(report => ({
        ...report,
        items: report.items.filter((item: any) => item.binNumber.trim() === this.selectedBinFilter.trim())
      }))
      .filter(report => report.items.length > 0);
  }

  // jetro filters works
  applyCustomerFilter() {
    if (!this.selectedCustomerFilter) {
      this.reports = [...this.allReportsBackup];
      return;
    }
    this.reports = this.allReportsBackup
      .map(report => ({
        ...report,
        items: report.items.filter((item: any) => item?.userName?.trim() === this.selectedCustomerFilter.trim())
      }))
      .filter(report => report.items.length > 0);
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
    if (this.selectedOrderReportType === 'Warehouse') {
      this.getWarehouseReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Pickup') {
      this.getPickupReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
  }



  onStatusChange(product: any) {
    const remark = product.remark || '';
    this.orderDetailService.changeStatusOfProduct(product?.orderItemId, product?.confirmStatus, remark)
      .subscribe({
        next: (res) => {
          console.log('Product status updated successfully', res);
          this.setOrderReportType(this.selectedOrderReportType);
        },
        error: (err) => {
          console.error('Error updating product status', err);
        }
      });
  }

  showProductReplaceModal(template: TemplateRef<any>, product: any) {
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
    this.orderDetailService.changeproduct(this.selectedProduct?.orderId, this.selectedProduct?.productId, this.productform.value.productId, this.selectedProduct?.orderItemId, this.productform.value.quantity).subscribe({
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
          this.setOrderReportType(this.selectedOrderReportType);
        },
        error: (err) => {
          console.error('Error saving weight', err);
        }
      });
  }

  onSearch() {
    this.getOrdersReports(this.selectedOrderReportType);
  }

  getOrdersReports(type: any) {
    this.selectedOrderReportType = type;
    if (this.selectedOrderReportType === 'Pickup') {
      this.getPickupReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Jetro One') {
      this.getJetroOneReport(this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Jetro Two') {
      this.getJetroTwoReport(this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Warehouse') {
      this.getWarehouseReport(this.selectedDate, this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Freezer One') {
      this.getFreezerOneReport(this.searchText, this.pageNo, this.pageSize);
    }
    if (this.selectedOrderReportType === 'Freezer Two') {
      this.getFreezerTwoReport(this.searchText, this.pageNo, this.pageSize);
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

}
