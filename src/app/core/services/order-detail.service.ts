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

  searchProduct(orderId: any, search: string): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getAllProductsByOrderIdAndBinFilter?OrderId=${orderId}&search=${search}`);
  }

  changeStatusOfProduct(orderItemId: number, confirmStatus: string, remark: string) {
    return this.http.get<any>(`${environment.baseUrl}/order/changeStatusOfProduct?orderItemId=${orderItemId}&confirmStatus=${confirmStatus}&remark=${remark}`);
  }

}
