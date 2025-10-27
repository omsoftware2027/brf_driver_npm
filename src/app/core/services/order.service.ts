import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  getAllOrders(dId: number, startDate: string): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getAllOrdersByDriverId?startDate=${startDate}`);
  }

  searchOrders(dId: number, startDate: string, search: string): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}/driver/getAllOrdersByDriverId?search=${search}&startDate=${startDate}`
    );
  }

  getAllDrivers() {
    return this.http.get<any>(`${environment.baseUrl}/order/getAllDriverName`);
  }

  filterOrdersByDriver(startDate: string, search: string, driverId?: any): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}/driver/getAllOrdersByDriverId?search=${search}&startDate=${startDate}&driverId=${driverId}`
    );
  }

}
