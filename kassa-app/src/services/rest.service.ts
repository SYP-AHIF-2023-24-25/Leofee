import { Order } from '../model/buffet/order';
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Product } from 'src/model/buffet/product';
import { IBuffet } from 'src/model/buffet/buffet';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  baseUrl = '';

  constructor(
    private http: HttpClient) {
    this.baseUrl = environment.httpUrl;
  }
  getProducts() : Observable<Product[]> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<Product[]>(
        this.baseUrl + 'Products',
        {headers});
  }
  getBuffets() : Observable<IBuffet[]> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<IBuffet[]>(
        this.baseUrl + 'Buffets',
        {headers});
  }
  async sendOrder(order: Order) {
    // console.log('Posting result to server: ');
    // console.log(order);
    const toSend = {
      buffetId : order.buffet.id,
      date : order.time,
      soldUnits : order.orderItems,
      orderNumber: '1'
    }
    let headers: HttpHeaders = new HttpHeaders();
    //headers = this.addAuthorizationHeader(headers);
    return await this.http.post(
        this.baseUrl + 'orders',
        toSend,
        {headers: headers}).toPromise();
  }
}
