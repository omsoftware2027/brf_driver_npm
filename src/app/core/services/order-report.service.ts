import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderReportService {

  constructor(public http: HttpClient) { }

  getPickupReports(date: any, driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getPickupOrdersByDriverId?date=${date}&driverId=${driverId}&sortBy=route`);
  }
  getJetroOneReports(date: any, driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getJetroOneByDriverId?date=${date}&driverId=${driverId}`);
  }
  getJetroTwoReports(date: any, driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getJetroTwoByDriverId?date=${date}&driverId=${driverId}`);
  }
  getWarehouseReports(date: any, driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getWarehouseOrdersByDriverId?date=${date}&driverId=${driverId}&sortBy=route`);
  }
  getFreezerOneReports(date: any, driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getFreezerOneByDriverId?date=${date}&driverId=${driverId}&sortBy=route`);
  }
  getFreezerTwoReports(date: any, driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getFreezerTwoByDriverId?date=${date}&driverId=${driverId}&sortBy=route`);
  }
}
