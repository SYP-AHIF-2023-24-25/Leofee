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
import { BonResponse } from 'src/model/Bon';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
    return this.http.get<Student>(this.baseUrlLeofeeBackend+ "api/Students/id/" + id);
  }


  getCurrentBon(): Observable<BonResponse | null> {
    let headers: HttpHeaders = new HttpHeaders();
    let bon:  Observable<BonResponse | null>;
    console.log("getCurrentBon");
    bon = this.http.get<BonResponse>(
      this.baseUrlLeofeeBackend + "currentBonWithBalance",
      { headers }
    ).pipe(
      catchError(error => {
        console.error("Error in getCurrentBon", error);
        return of(null); 
      })
    );
    console.log("Fertig");
    console.log(bon);
    return bon
  }



  

  async saveBookings(buffet: IBuffet, bonBooking: BonBooking) {    
    const order = new Order(new Date(), buffet, bonBooking);    
    
    order.orderItems = buffet.products.filter(b => b.amount > 0).map(p => {
      console.log(p);
      const oi = new OrderItem(p.id, p.amount);
      return oi;
    });

    if(bonBooking.studentId != '')
    {
      var gutschein = buffet.products.find(p => p.name == "Gutschein");
      if(gutschein != undefined)
      {
        gutschein.amount = bonBooking.amount;
        order.orderItems.push(new OrderItem(gutschein.id, 1));
      }
    }
    console.log(order.orderItems);

    await this.sendOrder(order)
    .then(
      ok => console.log(`Response: ${JSON.stringify(ok)}`),
      rejected => console.log(rejected));   
  }

  getProducts() : Observable<Product[]> {
    console.log(this.baseUrlTadeotBackend);
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<Product[]>(
        this.baseUrlTadeotBackend + 'products',
        {headers});
  }
  getBuffets() : Observable<IBuffet[]> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<IBuffet[]>(
        this.baseUrlTadeotBackend + 'Buffets',
        {headers});
  }

  Pay(id: String, amount: number): Observable<any> {
    //y?amount=3.0&studentId=if200145
    let url = this.baseUrlLeofeeBackend + `student/pay?amount=${amount}&studentId=${id}`; 
    return this.http.post<any>(url,{},);
  }

  getStudentBalance(id: String): Observable<number> {
    let headers: HttpHeaders = new HttpHeaders();
    //'http://localhost:5015/api/Students/if200145/balance
    //http://localhost:5015/api/Student/if200145/balance
    return this.http.get<number>(this.baseUrlLeofeeBackend+ "api/Students/"+"balance/" +id,
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
