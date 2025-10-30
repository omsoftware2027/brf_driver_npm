import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  getAllOrders(dId: number, startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getAllOrdersByDriverId?startDate=${startDate}&endDate=${endDate}`);
  }

  searchOrders(dId: number, startDate: string, search: string): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}/driver/getAllOrdersByDriverId?search=${search}&startDate=${startDate}`
    );
  }

  getAllDrivers() {
    return this.http.get<any>(`${environment.baseUrl}/order/getAllDriverName`);
  }

  filterOrdersByDriver(startDate: string, endDate: string, search: string, driverId?: any): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}/driver/getAllOrdersByDriverId?search=${search}&startDate=${startDate}&endDate=${endDate}&driverId=${driverId}`
    );
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
