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
    ) {

  }


  async loadProducts() {
    const products = await this.restService.getProducts().toPromise();
    if (products)
      this.products = products;
 
  }

  async getStudentById(id: string): Promise<any> {
    return await this.restService.getStudentById(id);
  }

  public async getBalanceForStudent(id: string): Promise<number> {
    let balance = await this.restService.getStudentBalance(id).toPromise();
    return balance! /100;
}

  async Pay( id: string, amount: number): Promise<any> {
    console.log(amount * 100);
    console.log(id);   
    amount = amount * 100;
    return await this.restService.Pay(id, amount).toPromise();
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
