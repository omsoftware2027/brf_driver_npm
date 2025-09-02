import { Component, TemplateRef } from '@angular/core';
import { OrderReportService } from '../../core/services/order-report.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderDetailService } from '../../core/services/order-detail.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-order-report',
  imports: [CommonModule, FormsModule, BsDatepickerModule],
  templateUrl: './order-report.component.html',
  styleUrl: './order-report.component.scss',
  providers: [DatePipe]
})
export class OrderReportComponent {
  selectedOrderReportType: string = 'Pickup';
  lastSevenDayDate: string = '';
  user: any;
  reports: any = {};

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

  constructor(
    public orderReportService: OrderReportService,
    public authService: AuthService,
    public orderDetailService: OrderDetailService,
    public datePipe: DatePipe,
    public modalService: BsModalService,
  ) {
    const today = new Date();
    this.lastSevenDayDate = today.toISOString().split('T')[0];
  };

  ngOnInit() {
    this.authService.user$.subscribe(
      user => {
        this.user = user;
        this.getPickupReport(this.lastSevenDayDate, this.user?.id);
      })
  }

  setOrderReportType(type: string) {
    const driverId = this.user?.id;
    this.selectedOrderReportType = type;
    if (this.selectedOrderReportType === 'Pickup') {
      this.getPickupReport(this.lastSevenDayDate, driverId);
    }
    if (this.selectedOrderReportType === 'Jetro One') {
      this.getJetroOneReport(this.lastSevenDayDate, driverId);
    }
    if (this.selectedOrderReportType === 'Jetro Two') {
      this.getJetroTwoReport(this.lastSevenDayDate, driverId);
    }
    if (this.selectedOrderReportType === 'Warehouse') {
      this.getWarehouseReport(this.lastSevenDayDate, driverId);
    }
    if (this.selectedOrderReportType === 'Freezer One') {
      this.getFreezerOneReport(this.lastSevenDayDate, driverId);
    }
    if (this.selectedOrderReportType === 'Freezer Two') {
      this.getFreezerTwoReport(this.lastSevenDayDate, driverId);
    }
  }

  getPickupReport(date: any, driverId: any) {
    this.orderReportService.getPickupReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
      }
    })
  }
  getJetroOneReport(date: any, driverId: any) {
    this.orderReportService.getJetroOneReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
      }
    })
  }
  getJetroTwoReport(date: any, driverId: any) {
    this.orderReportService.getJetroTwoReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
      }
    })
  }
  getWarehouseReport(date: any, driverId: any) {
    this.orderReportService.getWarehouseReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
      }
    })
  }
  getFreezerOneReport(date: any, driverId: any) {
    this.orderReportService.getFreezerOneReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
      }
    })
  }
  getFreezerTwoReport(date: any, driverId: any) {
    this.orderReportService.getFreezerTwoReports(date, driverId).subscribe({
      next: (res) => {
        this.reports = Object.entries(res.response.dataSet).map(([vendor, items]: any) => ({
          vendor,
          items
        }));
      },
      error: (err) => {
        console.error('something is wrong...', err)
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
      class: 'modal-dialog-centered modal-sm'
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
        console.log('Inventory item not found:', inventoryItem);
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
      this.modalRef?.hide();
    });
  }

}
