import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {

  constructor(private http: HttpClient) {}

  createOrder(amount: number) {
    return this.http.post<any>(
      `${environment.apiUrl}/paypal/create-order`,
      { amount }
    );
  }

  captureOrder(orderID: string) {
    return this.http.post<any>(
      `${environment.apiUrl}/paypal/capture-order`,
      { orderID }
    );
  }
}
