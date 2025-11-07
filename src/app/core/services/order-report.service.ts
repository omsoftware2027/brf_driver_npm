import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderReportService {

  constructor(public http: HttpClient) { }

  getPickupReports(date?: any, search?: string, pageNo?: any, pageSize?: any): Observable<any> {
    let url = `${environment.baseUrl}/driver/getPickupOrdersByDriverId?sortBy=route`;
    const params: string[] = [];

    if (date) {
      params.push(`date=${encodeURIComponent(date)}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (pageNo >= 0 && !search && !date) {
      params.push(`pageNo=${pageNo}`);
    }
    if (pageSize  && !search && !date) {
      params.push(`pageSize=${pageSize}`);
    }
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    return this.http.get<any>(url);
  }

  getJetroOneReports(search?: string, pageNo?: any, pageSize?: any): Observable<any> {
    let url = `${environment.baseUrl}/driver/getJetroOneByDriverId?sortBy=userName`;
    const params: string[] = [];

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (pageNo >= 0 && !search) {
      params.push(`pageNo=${pageNo}`);
    }
    if (pageSize && !search) {
      params.push(`pageSize=${pageSize}`);
    }
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    return this.http.get<any>(url);
  }
  
  getJetroTwoReports(search?: string, pageNo?: any, pageSize?: any): Observable<any> {
    let url = `${environment.baseUrl}/driver/getJetroTwoByDriverId?sortBy=userName`;
    const params: string[] = [];

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (pageNo >= 0 && !search) {
      params.push(`pageNo=${pageNo}`);
    }
    if (pageSize && !search) {
      params.push(`pageSize=${pageSize}`);
    }
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    return this.http.get<any>(url);
  }

  getWarehouseReports(date?: any, search?: string, pageNo?: any, pageSize?: any): Observable<any> {
    let url = `${environment.baseUrl}/driver/getWarehouseOrdersByDriverId?sortBy=route`;
    const params: string[] = [];

    if (date) {
      params.push(`date=${encodeURIComponent(date)}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (pageNo >= 0 && !search && !date) {
      params.push(`pageNo=${pageNo}`);
    }
    if (pageSize && !search && !date) {
      params.push(`pageSize=${pageSize}`);
    }
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    return this.http.get<any>(url);
  }
  getFreezerOneReports(search?: string, pageNo?: any, pageSize?: any): Observable<any> {
    let url = `${environment.baseUrl}/driver/getFreezerOneByDriverId?sortBy=route`;
    const params: string[] = [];

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (pageNo >= 0 && !search) {
      params.push(`pageNo=${pageNo}`);
    }
    if (pageSize && !search) {
      params.push(`pageSize=${pageSize}`);
    }
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    return this.http.get<any>(url);
  }
  getFreezerTwoReports(search?: string, pageNo?: any, pageSize?: any): Observable<any> {
    let url = `${environment.baseUrl}/driver/getFreezerTwoByDriverId?sortBy=route`;
    const params: string[] = [];

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (pageNo >= 0 && !search) {
      params.push(`pageNo=${pageNo}`);
    }
    if (pageSize && !search) {
      params.push(`pageSize=${pageSize}`);
    }
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    return this.http.get<any>(url);
  }
}
