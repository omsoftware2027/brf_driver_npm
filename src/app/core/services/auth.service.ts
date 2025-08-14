import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();


  constructor(private http: HttpClient) { 
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/auth/login`, credentials);
  }

  // Manage userinfo in local storage
  setUser(user: any) {
    localStorage.setItem('userInfo', JSON.stringify(user));
    this.userSubject.next(user);
  }
  clearUser() {
    localStorage.removeItem('userInfo');
    this.userSubject.next(null);
  }
}
