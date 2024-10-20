import { Order } from '../model/buffet/order';
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Product } from 'src/model/buffet/product';
import { IBuffet } from 'src/model/buffet/buffet';
import { Student } from '../model/Student';
import { OrderItem } from 'src/model/buffet/order-items';
import { BonBooking } from 'src/model/buffet/bonBooking';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  baseUrlTadeotBackend = '';
  baseUrlLeofeeBackend = '';

  constructor(
    private http: HttpClient) {
    this.baseUrlTadeotBackend = environment.httpUrlTadeotBackend;
    this.baseUrlLeofeeBackend = environment.httpUrlLeofeeBackend;   
  }

  getStudentById(id: string): Observable<Student> {
    return this.http.get<Student>(this.baseUrlLeofeeBackend+ "api/Student/" + id);
  }

  async saveBookings(buffet: IBuffet, bonBooking: BonBooking) {    
    const order = new Order(new Date(), buffet, bonBooking);    
    console.log(order.bonBooking);
    console.log(buffet.products);
    console.log(buffet.location);
    order.orderItems = buffet.products.filter(b => b.amount > 0).map(p => {
      console.log(p);
      const oi = new OrderItem(p.id, p.amount);
      return oi;
    });

    //// console.log(order);
    await this.sendOrder(order)
      .then(
        ok => console.log(`Response: ${JSON.stringify(ok)}`),
        rejected => console.log(rejected));
  }

  getProducts() : Observable<Product[]> {
    console.log(this.baseUrlTadeotBackend);
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<Product[]>(
        this.baseUrlTadeotBackend + 'Products',
        {headers});
  }
  getBuffets() : Observable<IBuffet[]> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<IBuffet[]>(
        this.baseUrlTadeotBackend + 'Buffets',
        {headers});
  }

  Pay(id: String, amount: number): Observable<any> {
    let url = this.baseUrlLeofeeBackend + `pay?amount=${amount}&studentId=${id}`; 
    return this.http.post<any>(url,{},);
  }

  getStudentBalance(id: String): Observable<number> {
    let headers: HttpHeaders = new HttpHeaders();
 
    return this.http.get<number>(this.baseUrlLeofeeBackend+ "api/Student/"+ id+"/balance",
        {headers});
}
  async sendOrder(order: Order) {
    // console.log('Posting result to server: ');
    // console.log(order);
    const toSend = {
      buffetId : order.buffet.id,
      date : order.time,
      soldUnits : order.orderItems,
      orderNumber: '1',
      bon: order.bonBooking,  
    }
    console.log(toSend);

    let headers: HttpHeaders = new HttpHeaders();
    //headers = this.addAuthorizationHeader(headers);
    return await this.http.post(
        this.baseUrlTadeotBackend + 'orders',
        toSend,
        {headers: headers}).toPromise();
  }
}
