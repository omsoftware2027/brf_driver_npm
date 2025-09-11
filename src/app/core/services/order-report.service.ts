import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderReportService {

  constructor(public http: HttpClient) { }

  getPickupReports(driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getPickupOrdersByDriverId?driverId=${driverId}&sortBy=route`);
  }
  getJetroOneReports(driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getJetroOneByDriverId?driverId=${driverId}&sortBy=userName`);
  }
  getJetroTwoReports(driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getJetroTwoByDriverId?driverId=${driverId}&sortBy=userName`);
  }
  getWarehouseReports(driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getWarehouseOrdersByDriverId?driverId=${driverId}&sortBy=route`);
  }
  getFreezerOneReports(driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getFreezerOneByDriverId?driverId=${driverId}&sortBy=route`);
  }
  getFreezerTwoReports(driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getFreezerTwoByDriverId?driverId=${driverId}&sortBy=route`);
  }
}
