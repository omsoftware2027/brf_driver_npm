import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderReportService {

  constructor(public http: HttpClient) { }

  getPickupReports(driverId: any, date?: string): Observable<any> {
    let url = `${environment.baseUrl}/driver/getPickupOrdersByDriverId?sortBy=route`;
    if (date) {
      url += `&date=${encodeURIComponent(date)}`;
    }
    return this.http.get<any>(url);
  }
  getJetroOneReports(driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getJetroOneByDriverId?sortBy=userName`);
  }
  getJetroTwoReports(driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getJetroTwoByDriverId?sortBy=userName`);
  }
  getWarehouseReports(driverId: any, date?: string): Observable<any> {
    let url = `${environment.baseUrl}/driver/getWarehouseOrdersByDriverId?sortBy=route`;
    if (date) {
      url += `&date=${encodeURIComponent(date)}`;
    }
    return this.http.get<any>(url);
  }
  getFreezerOneReports(driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getFreezerOneByDriverId?sortBy=route`);
  }
  getFreezerTwoReports(driverId: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getFreezerTwoByDriverId?sortBy=route`);
  }
}
