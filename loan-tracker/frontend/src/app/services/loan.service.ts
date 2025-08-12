import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'http://localhost:3000/api/loans';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getLoans(filters?: any): Observable<any> {
    const headers = this.getHeaders();
    let url = this.apiUrl;
    if (filters) {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      url += `?${params.toString()}`;
    }
    return this.http.get(url, { headers });
  }

  getLoan(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createLoan(loan: any): Observable<any> {
    return this.http.post(this.apiUrl, loan, { headers: this.getHeaders() });
  }

  updateLoan(id: number, loan: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, loan, { headers: this.getHeaders() });
  }

  deleteLoan(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/stats`, { headers: this.getHeaders() });
  }

  updateLoanStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  getPermissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/permissions`, { headers: this.getHeaders() });
  }
}