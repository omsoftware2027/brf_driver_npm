import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailService {

  constructor(public http: HttpClient) { }

  getAllproducts(orderId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getAllProductsByOrderIdAndBinFilter?OrderId=${orderId}`)
  }

  getProductsByRoute(orderId: any, route: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getAllProductsByOrderIdAndBinFilter?OrderId=${orderId}&route=${route}`)
  }

  getProductsByBinNo(orderId: any, binNumber: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getAllProductsByOrderIdAndBinFilter?OrderId=${orderId}&binNumber=${binNumber}`)
  }

  searchProduct(orderId: any, search?: string, route?: any, binNumber?: any): Observable<any> {
    let params: any = { OrderId: orderId };
    if (search) params.search = search; 
    if (route) params.route = route;
    if (binNumber) params.binNumber = binNumber;
    return this.http.get<any>(`${environment.baseUrl}/driver/getAllProductsByOrderIdAndBinFilter`, {params});
  }

  changeStatusOfProduct(orderItemId: number, confirmStatus: string, remark: string) {
    return this.http.get<any>(`${environment.baseUrl}/order/changeStatusOfProduct?orderItemId=${orderItemId}&confirmStatus=${confirmStatus}&remark=${remark}`);
  }

  saveWeight(orderItemId: number, weight: string) {
    return this.http.post<any>(`${environment.baseUrl}/order/saveWeight?orderItemId=${orderItemId}&weight=${weight}`, {});
  }

  saveRemark(orderItemId: number, remark: string) {
    return this.http.post<any>(`${environment.baseUrl}/order/updateRemarkByOrderItemsId?orderItemId=${orderItemId}&remark=${remark}`, {});
  }
  
  setProductExpiryDate(data: any){
    return this.http.post(`${environment.baseUrl}/order/saveOrUpdateOrderItemDate`, data);
  }
  getProductExpiryDates(ordersIdOrders: number, productId: number) {
    return this.http.get(`${environment.baseUrl}/order/getOrderItemDate?ordersIdOrders=${ordersIdOrders}&productId=${productId}`);
  }

  getProductsCounts(orderId: number): Observable<any> {
    return this.http.get(`${environment.baseUrl}/driver/getProductsCountByOrderId?OrderId=${orderId}`);
  }

  getOrderProductInventoryedit(productId:any, orderItemId:any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/order/getOrderProductInventory?productId=${productId}&orderItemId=${orderItemId}`)
  }
  checkWeightExists(weight: any, sku: any, orderItemId: any) {
    return this.http.get<any>(`${environment.baseUrl}/order/checkWeightExists?weight=${weight}&sku=${sku}&orderItemId=${orderItemId}`)
  }

  changeweight(weight: any, inventoryId: any, orderItemId: any) {
    const url = `${environment.baseUrl}/order/saveWeight?weight=${weight}&inventoryId=${inventoryId}&orderItemId=${orderItemId}`;
    return this.http.post(url, {});
  }

  getallproductlist(page: any, size: any) {
    return this.http.get<any>(`${environment.baseUrl}/order/getAllProduct?pageNo=${page}&pageSize=${size}`);
  }

  changeproduct(orderId: any, originalProductId: any, replaceProductId: any, orderItemId: any, quantity: any) {
    return this.http.get<any>(`${environment.baseUrl}/order/changeProduct?orderId=${orderId}&originalProductId=${originalProductId}&replaceProductId=${replaceProductId}&orderItemId=${orderItemId}&quantity=${quantity}`);
  }

}
