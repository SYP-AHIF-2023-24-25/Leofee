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

    console.log(this.baseUrl);
  }

  async BonPayment(id: String, amount: number): Promise<Observable<any>> {
    console.log(amount);
    let url = "http://localhost:5196/student/" + id + "/pay/" + amount ;
    return this.http.post<any>(url, {}, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });

  }
  getProducts() : Observable<Product[]> {
    console.log(this.baseUrl);
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

  getStudentBalance(id: String): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<any>(
      "http://localhost:5196/student/"+ id + '/balance',
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
