import { RestService } from './rest.service';
import { Sales } from '../model/buffet/sales';
import { Order } from '../model/buffet/order';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IBuffet } from 'src/model/buffet/buffet';
import { Product } from 'src/model/buffet/product';
import { OrderItem } from 'src/model/buffet/order-items';


@Injectable({
  providedIn: 'root'
})
export class DataService {



  buffets: IBuffet[] = [];
  sales: Sales[] = [];
  products: Product[] = [];


  constructor(
    private sourceLoader: HttpClient,
    private restService: RestService) {

  }


  async loadProducts() {
    // console.log('loadProducts');
    const products = await this.restService.getProducts().toPromise();
    if (products)
      this.products = products;
    // console.log(this.products);
  }

  async loadBuffetProducts() {
    // console.log('loadBuffetProducts');
    const buffets = await this.restService.getBuffets().toPromise();
    // console.log(buffets);
    if (buffets) this.buffets = buffets;
  }



  async saveBookings(buffet: IBuffet) {
    const order = new Order(new Date(), buffet);
    order.orderItems = buffet.products.filter(b => b.amount > 0).map(p => {
      //// console.log(p);
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
