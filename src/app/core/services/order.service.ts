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
  }): Observable<any> {
    let url = `${environment.baseUrl}/driver/getAllOrdersByDriverId?`;
    const params: string[] = [];
    if (options.startDate) params.push(`startDate=${encodeURIComponent(options.startDate)}`);
    if (options.endDate) params.push(`endDate=${encodeURIComponent(options.endDate)}`);
    if (options.search) params.push(`search=${encodeURIComponent(options.search)}`);
    if (options.assignedDriverId) params.push(`driverId=${encodeURIComponent(options.assignedDriverId)}`);
    url += params.join('&');
    return this.http.get<any>(url);
  }

    getAllOrders(dId: number, startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getAllOrdersByDriverId?startDate=${startDate}&endDate=${endDate}`);
  }

  getCombinedOrders(search?: string, date?: string) {
    let url = `${environment.baseUrl}/order/getGroupByOrder?pageNo=0&pageSize=1000`;
    const params: string[] = [];
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (date) {
      params.push(`date=${encodeURIComponent(date)}`);
    }
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    return this.http.get<any>(url);
  }

}
