import { RestService } from './rest.service';
import { Sales } from '../model/buffet/sales';
import { Order } from '../model/buffet/order';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IBuffet } from 'src/model/buffet/buffet';
import { Product } from 'src/model/buffet/product';
import { OrderItem } from 'src/model/buffet/order-items';
import { Student } from 'src/model/Student';
import {Bons} from 'src/model/Bon';
import { Observable } from 'rxjs';
import { BonBooking } from 'src/model/buffet/bonBooking';



@Injectable({
  providedIn: 'root'
})
export class DataService {



  buffets: IBuffet[] = [];
  sales: Sales[] = [];
  products: Product[] = [];


  constructor(
    private sourceLoader: HttpClient,
    private restService: RestService,
    private bonsService: HttpClient) {

  }


  async loadProducts() {
    // console.log('loadProducts');
    const products = await this.restService.getProducts().toPromise();
    if (products)
      this.products = products;
    // console.log(this.products);
  }


  async getStudentById(id: string): Promise<Observable<any>> {
    return this.bonsService.get<any>(
      "http://localhost:5196/students/" + id);
  }



  async getStudentBalance(id: string ): Promise<Observable<any>> {  
  
    return this.bonsService.get<any>(
      "http://localhost:5196/student/"+ id + '/balance')  ;
  }


  async Pay( id: string, amount: number): Promise<Observable<any>> {
    console.log(amount);
    console.log(id);
    let headers: HttpHeaders = new HttpHeaders();
    //http://localhost:5196/student/fe4ae22ae3f97a3ba0cc538ceb45f99469cd10d9686ff61296f97c6ca3f63490/pay/6.05`;
    //'http://localhost:5196/student/fe4ae22ae3f97a3ba0cc538ceb45f99469cd10d9686ff61296f97c6ca3f63490/pay/6.05'
    const url = `http://localhost:5196/student/${id}/pay/${amount}`;  
    //console.log(this.bonsService.post<any>(url, {}));
    console.log(url);
    return  this.bonsService.post<any>(url, {});
  }

  async loadBuffetProducts() {
    // console.log('loadBuffetProducts');
    const buffets = await this.restService.getBuffets().toPromise();
    // console.log(buffets);
    if (buffets) this.buffets = buffets;
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
    await this.restService.sendOrder(order)
      .then(
        ok => console.log(`Response: ${JSON.stringify(ok)}`),
        rejected => console.log(rejected));
  }

}
