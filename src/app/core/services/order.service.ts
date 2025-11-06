import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  getOrders(options: {
    driverId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    assignedDriverId?: number;
    pageNo?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Observable<any> {
    let url = `${environment.baseUrl}/driver/getAllOrdersByDriverId?`;
    const params: string[] = [];
    if (options.startDate) params.push(`startDate=${encodeURIComponent(options.startDate)}`);
    if (options.endDate) params.push(`endDate=${encodeURIComponent(options.endDate)}`);
    if (options.search) params.push(`search=${encodeURIComponent(options.search)}`);
    if (options.assignedDriverId) params.push(`driverId=${encodeURIComponent(options.assignedDriverId)}`);
    if ((options.pageNo !== undefined && options.pageNo >= 0 ) && (!options.search) && (!options.startDate) && (!options.assignedDriverId)) params.push(`pageNo=${options.pageNo}`);
    if (options.pageSize && (!options.search) && (!options.startDate) && (!options.assignedDriverId)) params.push(`pageSize=${options.pageSize}`);
    if (options.sortBy) params.push(`sortBy=${encodeURIComponent(options.sortBy)}`);
    if (options.sortDirection) params.push(`sortDirection=${options.sortDirection}`);

    url += params.join('&');
    return this.http.get<any>(url);
  }

    getAllOrders(dId: number, startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getAllOrdersByDriverId?startDate=${startDate}&endDate=${endDate}`);
  }

  getCombinedOrders(date?: any, driverId?: any, search?: string, pageNo?: any, pageSize?: any ) {
    let url = `${environment.baseUrl}/order/getGroupByOrder?sortBy=shippingDate`;
    const params: string[] = [];
    if (date) {
      params.push(`date=${encodeURIComponent(date)}`);
    }
    if (driverId) {
      params.push(`driverId=${driverId}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (pageNo >= 0 && !search && !date && !driverId) {
      params.push(`pageNo=${pageNo}`);
    }
    if (pageSize  && !search && !date && !driverId) {
      params.push(`pageSize=${pageSize}`);
    }
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    return this.http.get<any>(url);
  }

  setDriverWarehouse(orderId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/setDriverWarehouse?orderId=${orderId}`);
  }
  setDriverJetro(orderId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/setDriverJetro?orderId=${orderId}`);
  }

}
