import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

   private baseUrl = environment.baseUrl;
   
  constructor(private http: HttpClient) { }

  getOrdersCounts(dId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/driver/getDashboardStats?driverId=${dId}`)
  }
}
