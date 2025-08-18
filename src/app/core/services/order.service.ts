import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  getAllOrders(dId: number, startDate: string, status: number = 3): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getAllOrdersByDriverId?driverId=${dId}&startDate=${startDate}&order_status=${status}`);
  }

  searchOrders(dId: number, startDate: string, search: string, status: number = 3): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}/driver/getAllOrdersByDriverId?search=${search}&driverId=${dId}&startDate=${startDate}&order_status=${status}`
    );
  }

}
