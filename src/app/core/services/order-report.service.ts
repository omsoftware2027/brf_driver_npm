import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderReportService {

  constructor(public http: HttpClient) { }

  getAllOrderReport(date: any): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/driver/getAllItemByDeliveryDate?deliveryDate=${date}`)
  }

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
    if (pageSize && !search) {
      params.push(`pageSize=${pageSize}`);
    }
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    return this.http.get<any>(url);
  }

  getJetroOneReports(date?: any, search?: string, customerName?: any, pageNo?: any, pageSize?: any): Observable<any> {
    let url = `${environment.baseUrl}/driver/getJetroOneByDriverId?sortBy=userName`;
    const params: string[] = [];

    if (date) {
      params.push(`date=${encodeURIComponent(date)}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (customerName) {
      params.push(`customerName=${encodeURIComponent(customerName)}`);
    }
    if (pageNo >= 0 && !search && !date) {
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

  getJetroTwoReports(date?: any, search?: string, customerName?: any, pageNo?: any, pageSize?: any): Observable<any> {
    let url = `${environment.baseUrl}/driver/getJetroTwoByDriverId?sortBy=userName`;
    const params: string[] = [];

    if (date) {
      params.push(`date=${encodeURIComponent(date)}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (customerName) {
      params.push(`customerName=${encodeURIComponent(customerName)}`);
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

  getWarehouseReports(date?: any, search?: string, binFilter?: any, pageNo?: any, pageSize?: any): Observable<any> {
    let url = `${environment.baseUrl}/driver/getWarehouseOrdersByDriverId?sortBy=route`;
    const params: string[] = [];

    if (date) {
      params.push(`date=${encodeURIComponent(date)}`);
    }
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (binFilter) {
      params.push(`binFilter=${encodeURIComponent(binFilter)}`);
    }
    if (pageNo >= 0 && !search && !date && !binFilter) {
      params.push(`pageNo=${pageNo}`);
    }
    if (pageSize && !search && !binFilter) {
      params.push(`pageSize=${pageSize}`);
    }
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    return this.http.get<any>(url);
  }
  getFreezerOneReports(date?: any, search?: string, pageNo?: any, pageSize?: any): Observable<any> {
    let url = `${environment.baseUrl}/driver/getFreezerOneByDriverId?sortBy=route`;
    const params: string[] = [];

    if (date) {
      params.push(`date=${encodeURIComponent(date)}`);
    }
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
  getFreezerTwoReports(date?: any, search?: string, pageNo?: any, pageSize?: any): Observable<any> {
    let url = `${environment.baseUrl}/driver/getFreezerTwoByDriverId?sortBy=route`;
    const params: string[] = [];

    if (date) {
      params.push(`date=${encodeURIComponent(date)}`);
    }
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

  getCustomers(route: any, date?: string) {
    let url = `${environment.baseUrl}/driver/getJetroOneOrTwoCustomerNames?route=${route}`;
    if (date) {
      url += `&date=${date}`;
    }
    return this.http.get(url);
  }

}
